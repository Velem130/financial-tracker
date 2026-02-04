const TRANSACTIONS_KEY = 'finance_transactions_';

export const transactionUtils = {
  // Get current month-year key (e.g., "2024-01")
  getCurrentMonthKey: () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  // Get transactions for specific user and month
  getTransactions: (userId, monthKey = null) => {
    const key = monthKey || transactionUtils.getCurrentMonthKey();
    const userKey = `${TRANSACTIONS_KEY}${userId}_${key}`;
    return JSON.parse(localStorage.getItem(userKey)) || [];
  },

  // Save transaction for current user
  addTransaction: (userId, transaction) => {
    const monthKey = transactionUtils.getCurrentMonthKey();
    const userKey = `${TRANSACTIONS_KEY}${userId}_${monthKey}`;
    const transactions = transactionUtils.getTransactions(userId, monthKey);
    
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(userKey, JSON.stringify(transactions));
    return newTransaction;
  },

  // Get all months with data for a user
  getUserMonths: (userId) => {
    const months = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(`${TRANSACTIONS_KEY}${userId}_`)) {
        const monthKey = key.replace(`${TRANSACTIONS_KEY}${userId}_`, '');
        months.push(monthKey);
      }
    });
    
    return months.sort().reverse(); // Newest first
  },

  // Calculate totals for a month
  getMonthSummary: (userId, monthKey = null) => {
    const transactions = transactionUtils.getTransactions(userId, monthKey);
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });
    
    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length
    };
  },

  // Get yearly summary
  getYearlySummary: (userId, year) => {
    const months = transactionUtils.getUserMonths(userId);
    const yearMonths = months.filter(m => m.startsWith(year));
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    yearMonths.forEach(month => {
      const summary = transactionUtils.getMonthSummary(userId, month);
      totalIncome += summary.income;
      totalExpenses += summary.expenses;
    });
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      months: yearMonths.length
    };
  },

  // Delete a transaction
  deleteTransaction: (userId, transactionId, monthKey = null) => {
    const month = monthKey || transactionUtils.getCurrentMonthKey();
    const userKey = `${TRANSACTIONS_KEY}${userId}_${month}`;
    const transactions = transactionUtils.getTransactions(userId, month);
    
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem(userKey, JSON.stringify(updatedTransactions));
    return true;
  }
};