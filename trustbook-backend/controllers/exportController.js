const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Helper: gather statement data for an account
const getStatementData = async (accountId, year, month, userId) => {
  const account = await Account.findById(accountId).populate('owner', 'name').populate('partyUser', 'name');
  if (!account) throw new Error('Account not found');

  const isOwner = account.owner._id.toString() === userId;
  const isParty = account.partyUser && account.partyUser._id.toString() === userId;
  if (!isOwner && !isParty) throw new Error('Not authorized');

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await Transaction.find({
    account: accountId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1, createdAt: 1 });

  const previousTxn = await Transaction.findOne({
    account: accountId,
    date: { $lt: startDate },
  }).sort({ date: -1, createdAt: -1 });

  const openingBalance = previousTxn ? previousTxn.runningBalance : 0;
  const totalCredits = transactions.filter(t => t.type === 'CR').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'DR').reduce((s, t) => s + t.amount, 0);
  const closingBalance = transactions.length > 0
    ? transactions[transactions.length - 1].runningBalance
    : openingBalance;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    account,
    transactions,
    summary: { openingBalance, closingBalance, totalCredits, totalDebits },
    monthName: months[month - 1],
    year,
  };
};

// Format currency for display (avoid ₹ symbol — not supported by Helvetica in pdfkit)
const fmtCurrency = (n) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  return `${n < 0 ? '-' : ''}Rs.${formatted}`;
};

// ─── Export as PDF ───
exports.exportPDF = async (req, res) => {
  try {
    const { accountId, year, month } = req.params;
    const data = await getStatementData(accountId, Number(year), Number(month), req.userId);
    const { account, transactions, summary, monthName } = data;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename=TrustBook_${account.partyName}_${monthName}_${year}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#4338ca')
      .text('TrustBook', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
      .text('Account Statement', { align: 'center' });
    doc.moveDown(0.5);

    // Account info
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b')
      .text(`Account: ${account.partyName}`);
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
      .text(`Period: ${monthName} ${year}`);
    doc.moveDown(0.5);

    // Summary box
    const summaryY = doc.y;
    doc.fontSize(9).font('Helvetica').fillColor('#475569');
    doc.text(`Opening Balance: ${fmtCurrency(summary.openingBalance)}`, 40, summaryY);
    doc.text(`Total Credits: ${fmtCurrency(summary.totalCredits)}`, 220, summaryY);
    doc.text(`Total Debits: ${fmtCurrency(summary.totalDebits)}`, 40, summaryY + 14);
    doc.text(`Closing Balance: ${fmtCurrency(summary.closingBalance)}`, 220, summaryY + 14);
    doc.moveDown(1.5);

    // Separator
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const colX = { date: 40, narration: 120, credit: 320, debit: 400, balance: 480 };

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8');
    doc.text('DATE', colX.date, tableTop);
    doc.text('NARRATION', colX.narration, tableTop);
    doc.text('CREDIT', colX.credit, tableTop, { width: 70, align: 'right' });
    doc.text('DEBIT', colX.debit, tableTop, { width: 70, align: 'right' });
    doc.text('BALANCE', colX.balance, tableTop, { width: 75, align: 'right' });

    doc.moveTo(40, tableTop + 14).lineTo(555, tableTop + 14).strokeColor('#e2e8f0').stroke();

    // Table rows
    let y = tableTop + 20;
    doc.font('Helvetica').fontSize(9);

    for (const txn of transactions) {
      if (y > 750) {
        doc.addPage();
        y = 40;
      }

      const dateStr = new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.fillColor('#334155').text(dateStr, colX.date, y, { width: 75 });
      doc.fillColor('#1e293b').text(txn.narration, colX.narration, y, { width: 195 });

      if (txn.type === 'CR') {
        doc.fillColor('#059669').text(fmtCurrency(txn.amount), colX.credit, y, { width: 70, align: 'right' });
        doc.fillColor('#cbd5e1').text('—', colX.debit, y, { width: 70, align: 'right' });
      } else {
        doc.fillColor('#cbd5e1').text('—', colX.credit, y, { width: 70, align: 'right' });
        doc.fillColor('#e11d48').text(fmtCurrency(txn.amount), colX.debit, y, { width: 70, align: 'right' });
      }

      doc.fillColor(txn.runningBalance >= 0 ? '#1e293b' : '#e11d48')
        .text(fmtCurrency(txn.runningBalance), colX.balance, y, { width: 75, align: 'right' });

      y += 18;
    }

    if (transactions.length === 0) {
      doc.fontSize(10).fillColor('#94a3b8').text('No transactions for this period.', 40, y + 10, { align: 'center' });
    }

    // Footer
    doc.fontSize(7).fillColor('#94a3b8')
      .text(`Generated by TrustBook on ${new Date().toLocaleDateString('en-IN')}`, 40, 780, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate PDF' });
  }
};

// ─── Export as Excel ───
exports.exportExcel = async (req, res) => {
  try {
    const { accountId, year, month } = req.params;
    const data = await getStatementData(accountId, Number(year), Number(month), req.userId);
    const { account, transactions, summary, monthName } = data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TrustBook';
    const sheet = workbook.addWorksheet('Statement');

    // Title row
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `TrustBook — ${account.partyName} — ${monthName} ${year}`;
    titleCell.font = { size: 14, bold: true, color: { argb: 'FF4338CA' } };
    titleCell.alignment = { horizontal: 'center' };

    // Summary rows
    sheet.getCell('A3').value = 'Opening Balance:';
    sheet.getCell('B3').value = summary.openingBalance;
    sheet.getCell('B3').numFmt = '#,##0.00';
    sheet.getCell('C3').value = 'Closing Balance:';
    sheet.getCell('D3').value = summary.closingBalance;
    sheet.getCell('D3').numFmt = '#,##0.00';

    sheet.getCell('A4').value = 'Total Credits:';
    sheet.getCell('B4').value = summary.totalCredits;
    sheet.getCell('B4').numFmt = '#,##0.00';
    sheet.getCell('B4').font = { color: { argb: 'FF059669' } };
    sheet.getCell('C4').value = 'Total Debits:';
    sheet.getCell('D4').value = summary.totalDebits;
    sheet.getCell('D4').numFmt = '#,##0.00';
    sheet.getCell('D4').font = { color: { argb: 'FFE11D48' } };

    ['A3', 'A4', 'C3', 'C4'].forEach(c => {
      sheet.getCell(c).font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    });

    // Header row
    const headerRow = sheet.addRow([]);
    const headers = ['#', 'Date', 'Narration', 'Credit', 'Debit', 'Balance'];
    const hRow = sheet.addRow(headers);
    hRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });

    // Data rows
    transactions.forEach((txn, i) => {
      const dateStr = new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const row = sheet.addRow([
        i + 1,
        dateStr,
        txn.narration,
        txn.type === 'CR' ? txn.amount : '',
        txn.type === 'DR' ? txn.amount : '',
        txn.runningBalance,
      ]);

      // Color credit/debit cells
      if (txn.type === 'CR') {
        row.getCell(4).font = { color: { argb: 'FF059669' }, bold: true };
      } else {
        row.getCell(5).font = { color: { argb: 'FFE11D48' }, bold: true };
      }
      row.getCell(6).font = { bold: true, color: { argb: txn.runningBalance >= 0 ? 'FF1E293B' : 'FFE11D48' } };

      // Number format
      [4, 5, 6].forEach(c => { row.getCell(c).numFmt = '#,##0.00'; });

      // Alternating row color
      if (i % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }
    });

    // Column widths
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 35;
    sheet.getColumn(4).width = 15;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',
      `attachment; filename=TrustBook_${account.partyName}_${monthName}_${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate Excel' });
  }
};
