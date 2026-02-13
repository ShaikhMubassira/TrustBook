const Account = require('../models/Account');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Create a new account (party/ledger)
exports.createAccount = async (req, res) => {
  try {
    const { partyName, partyPhone, partyEmail, description } = req.body;

    if (!partyName || !partyName.trim()) {
      return res.status(400).json({ message: 'Party name is required' });
    }

    // Check if party has a TrustBook account
    let partyUser = null;
    if (partyEmail) {
      const existingUser = await User.findOne({ email: partyEmail.toLowerCase() });
      if (existingUser) {
        if (existingUser._id.toString() === req.userId) {
          return res.status(400).json({ message: 'You cannot create an account with yourself' });
        }
        partyUser = existingUser._id;
      }
    }

    const account = await Account.create({
      owner: req.userId,
      partyName: partyName.trim(),
      partyPhone: partyPhone?.trim() || '',
      partyEmail: partyEmail?.trim().toLowerCase() || '',
      partyUser,
      description: description?.trim() || '',
    });

    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this party name already exists' });
    }
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
};

// Get all accounts (owned by me)
exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ owner: req.userId })
      .sort({ updatedAt: -1 })
      .populate('partyUser', 'name email');
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
  }
};

// Get accounts where I'm the party (shared with me)
exports.getSharedAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ partyUser: req.userId })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shared accounts', error: error.message });
  }
};

// Get single account detail
exports.getAccountDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id)
      .populate('owner', 'name email')
      .populate('partyUser', 'name email');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Only owner or partyUser can view
    const isOwner = account.owner._id.toString() === req.userId;
    const isParty = account.partyUser && account.partyUser._id.toString() === req.userId;
    if (!isOwner && !isParty) {
      return res.status(403).json({ message: 'Not authorized to view this account' });
    }

    res.json({ account, role: isOwner ? 'owner' : 'party' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch account', error: error.message });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { partyName, partyPhone, partyEmail, description } = req.body;

    const account = await Account.findOne({ _id: id, owner: req.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (partyName) account.partyName = partyName.trim();
    if (partyPhone !== undefined) account.partyPhone = partyPhone.trim();
    if (description !== undefined) account.description = description.trim();

    // Update party email and auto-link
    if (partyEmail !== undefined) {
      account.partyEmail = partyEmail.trim().toLowerCase();
      if (partyEmail) {
        const linkedUser = await User.findOne({ email: partyEmail.toLowerCase() });
        account.partyUser = linkedUser && linkedUser._id.toString() !== req.userId ? linkedUser._id : null;
      } else {
        account.partyUser = null;
      }
    }

    await account.save();
    res.json({ message: 'Account updated', account });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this party name already exists' });
    }
    res.status(500).json({ message: 'Failed to update account', error: error.message });
  }
};

// Delete account (only if no transactions)
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findOne({ _id: id, owner: req.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const txnCount = await Transaction.countDocuments({ account: id });
    if (txnCount > 0) {
      return res.status(400).json({
        message: `Cannot delete — this account has ${txnCount} transaction(s). Delete them first.`,
      });
    }

    await Account.findByIdAndDelete(id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

// Get account transactions (for both owner and party)
exports.getAccountTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const isOwner = account.owner.toString() === req.userId;
    const isParty = account.partyUser && account.partyUser.toString() === req.userId;
    if (!isOwner && !isParty) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const transactions = await Transaction.find({ account: id })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments({ account: id });

    res.json({
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      role: isOwner ? 'owner' : 'party',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

// Get account monthly statement (for both owner and party)
exports.getAccountStatement = async (req, res) => {
  try {
    const { id, year, month } = req.params;

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const isOwner = account.owner.toString() === req.userId;
    const isParty = account.partyUser && account.partyUser.toString() === req.userId;
    if (!isOwner && !isParty) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      account: id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, createdAt: 1 });

    const previousTxn = await Transaction.findOne({
      account: id,
      date: { $lt: startDate },
    }).sort({ date: -1, createdAt: -1 });

    const openingBalance = previousTxn ? previousTxn.runningBalance : 0;
    const totalCredits = transactions.filter(t => t.type === 'CR').reduce((s, t) => s + t.amount, 0);
    const totalDebits = transactions.filter(t => t.type === 'DR').reduce((s, t) => s + t.amount, 0);
    const closingBalance = transactions.length > 0
      ? transactions[transactions.length - 1].runningBalance
      : openingBalance;

    res.json({
      account: { _id: account._id, partyName: account.partyName },
      transactions,
      summary: { openingBalance, closingBalance, totalCredits, totalDebits, transactionCount: transactions.length },
      role: isOwner ? 'owner' : 'party',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statement', error: error.message });
  }
};

// Search across all accounts
exports.searchAccounts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });

    const accounts = await Account.find({
      owner: req.userId,
      partyName: { $regex: q, $options: 'i' },
    }).sort({ updatedAt: -1 }).limit(20);

    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};
