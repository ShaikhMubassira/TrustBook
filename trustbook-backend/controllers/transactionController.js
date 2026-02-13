const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Helper: Recalculate running balances for an account from a date onward
const recalculateBalances = async (accountId, fromDate) => {
    const allAfter = await Transaction.find({ account: accountId, date: { $gte: fromDate } }).sort({ date: 1, createdAt: 1 });
    const previous = await Transaction.findOne({ account: accountId, date: { $lt: fromDate } }).sort({ date: -1, createdAt: -1 });
    let balance = previous ? previous.runningBalance : 0;

    for (const txn of allAfter) {
        balance = txn.type === 'CR' ? balance + txn.amount : balance - txn.amount;
        txn.runningBalance = balance;
        await txn.save();
    }
};

// Helper: Update cached totals on the account document
const updateAccountTotals = async (accountId) => {
    const agg = await Transaction.aggregate([
        { $match: { account: accountId } },
        {
            $group: {
                _id: null,
                totalCredits: { $sum: { $cond: [{ $eq: ['$type', 'CR'] }, '$amount', 0] } },
                totalDebits: { $sum: { $cond: [{ $eq: ['$type', 'DR'] }, '$amount', 0] } },
                count: { $sum: 1 },
            },
        },
    ]);

    const lastTxn = await Transaction.findOne({ account: accountId }).sort({ date: -1, createdAt: -1 });

    const vals = agg[0] || { totalCredits: 0, totalDebits: 0, count: 0 };
    await Account.findByIdAndUpdate(accountId, {
        totalCredits: vals.totalCredits,
        totalDebits: vals.totalDebits,
        transactionCount: vals.count,
        balance: lastTxn ? lastTxn.runningBalance : 0,
    });
};

// 1. Create a new transaction (must belong to an account)
exports.addTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        const { accountId, amount, type, narration, date } = req.body;

        if (!accountId) return res.status(400).json({ message: 'Account is required' });
        if (!amount || !type || !narration) {
            return res.status(400).json({ message: 'Amount, type, and narration are required' });
        }
        if (!['CR', 'DR'].includes(type)) {
            return res.status(400).json({ message: 'Type must be CR or DR' });
        }
        if (Number(amount) <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Verify account ownership
        const account = await Account.findOne({ _id: accountId, owner: userId });
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const lastEntry = await Transaction.findOne({ account: accountId }).sort({ date: -1, createdAt: -1 });
        const previousBalance = lastEntry ? lastEntry.runningBalance : 0;

        const newBalance = type === 'CR'
            ? previousBalance + Number(amount)
            : previousBalance - Number(amount);

        const newTransaction = new Transaction({
            user: userId,
            account: accountId,
            amount: Number(amount),
            type,
            narration: narration.trim(),
            date: date || Date.now(),
            runningBalance: newBalance,
        });

        await newTransaction.save();
        await updateAccountTotals(account._id);

        res.status(201).json({ message: 'Transaction saved successfully', transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Error saving transaction', error: error.message });
    }
};

// 2. Get all transactions across all accounts (paginated, for dashboard)
exports.getAllTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const transactions = await Transaction.find({ user: userId })
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('account', 'partyName');

        const total = await Transaction.countDocuments({ user: userId });

        res.json({ transactions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};

// 3. Dashboard stats with monthly trend
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        const allTransactions = await Transaction.find({ user: userId })
            .sort({ date: -1, createdAt: -1 })
            .populate('account', 'partyName');

        const totalCredits = allTransactions.filter(t => t.type === 'CR').reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = allTransactions.filter(t => t.type === 'DR').reduce((sum, t) => sum + t.amount, 0);

        // Current balance = sum of all CR - sum of all DR
        const currentBalance = totalCredits - totalDebits;
        const recentTransactions = allTransactions.slice(0, 5);

        // Account count
        const accountCount = await Account.countDocuments({ owner: userId });

        // Monthly trend — last 6 months
        const monthlyTrend = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthTxns = allTransactions.filter(t => {
                const td = new Date(t.date);
                return td >= mStart && td <= mEnd;
            });

            monthlyTrend.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                credits: monthTxns.filter(t => t.type === 'CR').reduce((s, t) => s + t.amount, 0),
                debits: monthTxns.filter(t => t.type === 'DR').reduce((s, t) => s + t.amount, 0),
            });
        }

        res.json({
            currentBalance,
            totalCredits,
            totalDebits,
            totalTransactions: allTransactions.length,
            accountCount,
            recentTransactions,
            monthlyTrend,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

// 4. Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const transaction = await Transaction.findOne({ _id: id, user: userId });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const accountId = transaction.account;
        const txnDate = transaction.date;
        await Transaction.findByIdAndDelete(id);

        await recalculateBalances(accountId, txnDate);
        await updateAccountTotals(accountId);

        res.json({ message: 'Transaction deleted and balances recalculated' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
};

// 5. Search transactions
exports.searchTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query is required' });

        const transactions = await Transaction.find({
            user: userId,
            narration: { $regex: q, $options: 'i' },
        }).sort({ date: -1 }).limit(20).populate('account', 'partyName');

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error searching transactions', error: error.message });
    }
};