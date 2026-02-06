import React, { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import FinancialCharts from './FinancialCharts';
import BudgetTracker from './BudgetTracker';

function Dashboard({ 
  user, 
  onLogout,
  transactions,
  selectedMonth,
  onMonthChange,
  onAddTransaction,
  onDeleteTransaction,
  onRefreshTransactions,
  onSwitchToCurrentMonth
}) {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get month name
  function getMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Extract unique months from transactions
  useEffect(() => {
    const months = [...new Set(transactions.map(t => t.monthYear))].sort().reverse();
    setAvailableMonths(months);
  }, [transactions]);

  const handleAddTransaction = async (transaction) => {
    setError(null);
    try {
      await onAddTransaction(transaction);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      setError(error.message || 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Delete this transaction?')) {
      setError(null);
      try {
        await onDeleteTransaction(transactionId);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        setError(error.message || 'Failed to delete transaction');
      }
    }
  };

  // Calculate summary from transactions
  const getSummary = () => {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += parseFloat(transaction.amount);
      } else {
        expenses += parseFloat(transaction.amount);
      }
    });
    
    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length
    };
  };

  const summary = getSummary();
  const currentMonth = getMonthName(selectedMonth);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm underline hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-blue-600 text-white rounded-lg shadow-lg"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
         
          <div className="lg:hidden fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-blue-600 mb-2">Finance Tracker</h2>
              <p className="text-sm text-gray-600 truncate">{user?.email || 'User'}</p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => { setActiveTab('transactions'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'transactions' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                💰 Transactions
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => { setActiveTab('budget'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'budget' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📋 Budget
              </button>
              <button
                onClick={() => { setActiveTab('export'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === 'export' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📥 Export
              </button>
              <div className="pt-4 mt-4 border-t">
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Nav */}
      <nav className="hidden lg:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-blue-600">
                Finance Tracker
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-medium">{user?.email || 'User'}</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 pt-16 lg:pt-8">
        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden lg:flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'budget'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Budget
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📥 Export
          </button>
        </div>

        {/* Mobile Current Tab Display */}
        <div className="lg:hidden mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-blue-600 mb-2">
            {activeTab === 'transactions' && '💰 Transactions'}
            {activeTab === 'analytics' && '📊 Analytics'}
            {activeTab === 'budget' && '📋 Budget'}
            {activeTab === 'export' && '📥 Export'}
          </h2>
          <p className="text-sm text-gray-600">
            Tap menu button ☰ to switch sections
          </p>
        </div>

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <>
            {/* Month Selector - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Month
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => onMonthChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={selectedMonth}>
                        {currentMonth} (Current)
                      </option>
                      {availableMonths
                        .filter(m => m !== selectedMonth)
                        .map(month => (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        ))}
                    </select>
                    <button 
                      onClick={onSwitchToCurrentMonth}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Today
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats - Stack on mobile */}
                <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-600">Balance</p>
                    <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R{summary.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-600">Transactions</p>
                    <p className="text-xl font-bold text-blue-600">
                      {transactions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Total Balance
                </h3>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R{summary.balance.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Income
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  R{summary.income.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Expenses
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  R{summary.expenses.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Transaction Form */}
            <div className="mb-6">
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>

            {/* Transactions List - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedMonth === getCurrentMonthKey() ? 'This Month' : 'History'}
              </h3>
              
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No transactions yet. Add your first one!
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions
                    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                    .map(transaction => (
                      <div 
                        key={transaction.id} 
                        className={`p-3 rounded-lg border-l-4 ${
                          transaction.type === 'income' 
                            ? 'border-l-green-500 bg-green-50' 
                            : 'border-l-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                transaction.type === 'income'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type === 'income' ? 'INCOME' : 'EXPENSE'}
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                                {transaction.category?.toUpperCase() || 'UNCATEGORIZED'}
                              </span>
                            </div>
                            <p className="font-medium text-sm">{transaction.description || 'No description'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <div className="text-right ml-2">
                            <p className={`text-lg font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}R{parseFloat(transaction.amount).toFixed(2)}
                            </p>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="mt-1 text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="px-0 sm:px-2">
            <FinancialCharts transactions={transactions} />
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="px-0 sm:px-2">
              <BudgetTracker />
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Export Your Data</h3>
            <p className="text-gray-600 mb-6">
              Download your financial data for backup.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(transactions, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  
                  const exportFileDefaultName = `finance-data-${user?.id || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
              >
                📥 Download All Data (JSON)
              </button>
              
              <button
                onClick={() => {
                  const csvHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
                  const csvRows = transactions.map(t => [
                    new Date(t.transactionDate).toLocaleDateString(),
                    t.type,
                    t.category,
                    t.description,
                    t.amount
                  ]);
                  
                  const csvContent = [
                    csvHeaders.join(','),
                    ...csvRows.map(row => row.join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `transactions-${selectedMonth}.csv`;
                  a.click();
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                📄 Export Current Month (CSV)
              </button>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium text-sm">⚠️ Important</p>
                <p className="text-yellow-700 text-xs mt-1">
                  Your data is stored in the database. Export regularly to backup your financial records.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default Dashboard;