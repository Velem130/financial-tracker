import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authUtils } from './utils/auth';
import { apiService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  // Helper function to get current month key (YYYY-MM)
  function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Helper function to get month name
  function getMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const user = authUtils.getUser();
    const token = authUtils.getToken();
    
    if (user && token) {
      setCurrentUser({
        email: user.email,
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName
      });
      // Load transactions when user logs in
      loadTransactions();
    }
    setLoading(false);
  }, []);

  // Auto-detect month change and switch to current month
  useEffect(() => {
    const checkAndUpdateMonth = () => {
      const currentMonth = getCurrentMonthKey();
      if (selectedMonth !== currentMonth) {
        console.log(`Month changed from ${selectedMonth} to ${currentMonth}`);
        setSelectedMonth(currentMonth);
        // Refresh transactions for the new month
        if (currentUser) {
          loadTransactions();
        }
      }
    };

    // Check immediately
    checkAndUpdateMonth();

    // Set up interval to check daily (at midnight)
    const now = new Date();
    const millisecondsUntilMidnight = 
      (24 * 60 * 60 * 1000) - 
      (now.getHours() * 60 * 60 * 1000 + 
       now.getMinutes() * 60 * 1000 + 
       now.getSeconds() * 1000 + 
       now.getMilliseconds());
    
    // First timeout to check at midnight
    const midnightTimeout = setTimeout(() => {
      checkAndUpdateMonth();
      // Then check daily
      const dailyInterval = setInterval(checkAndUpdateMonth, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, millisecondsUntilMidnight);

    return () => {
      clearTimeout(midnightTimeout);
    };
  }, [selectedMonth, currentUser]);

  // Load transactions when month changes or user logs in
  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [selectedMonth, currentUser]);

  const loadTransactions = async () => {
    if (!currentUser) return;
    
    try {
      console.log(`Loading transactions for month: ${selectedMonth} (${getMonthName(selectedMonth)})`);
      const data = await apiService.getTransactions(selectedMonth);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    loadTransactions();
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    setCurrentUser(null);
    setTransactions([]);
    // Reset to current month on logout
    setSelectedMonth(getCurrentMonthKey());
  };

  const handleAddTransaction = async (transaction) => {
    try {
      const newTransaction = await apiService.addTransaction({
        ...transaction,
        monthYear: selectedMonth
      });
      
      // Add the new transaction to state
      setTransactions([...transactions, newTransaction]);
      
      // Refresh the list to ensure we have latest data
      loadTransactions();
      
      return newTransaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await apiService.deleteTransaction(transactionId);
      
      // Remove the transaction from state
      setTransactions(transactions.filter(t => t.id !== transactionId));
      
      // Refresh the list to ensure we have latest data
      loadTransactions();
      
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };

  const handleMonthChange = (month) => {
    console.log(`Manual month change to: ${month} (${getMonthName(month)})`);
    setSelectedMonth(month);
  };

  const handleSwitchToCurrentMonth = () => {
    const currentMonth = getCurrentMonthKey();
    if (selectedMonth !== currentMonth) {
      console.log(`Switching to current month: ${currentMonth}`);
      setSelectedMonth(currentMonth);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your finance tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!currentUser ? (
        <div>
          {/* Hero Section on Login Page */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Personal Finance Tracker
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Take control of your finances. Track, analyze, and grow your wealth.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-bold text-lg mb-2">Bank-Level Security</h3>
                  <p className="text-blue-100">Your data is encrypted and protected with enterprise-grade security</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-bold text-lg mb-2">Smart Tracking</h3>
                  <p className="text-blue-100">Automatic monthly organization and complete transaction history</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-bold text-lg mb-2">Visual Insights</h3>
                  <p className="text-blue-100">Beautiful charts and analytics to understand your spending</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form */}
          <Login onLogin={handleLogin} />
          
          {/* Footer */}
          <div className="bg-gray-800 text-white py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-400">
                Finance Tracker © {new Date().getFullYear()} • All Rights Reserved
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Secure • Private • Encrypted
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout}
          transactions={transactions}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onRefreshTransactions={loadTransactions}
          onSwitchToCurrentMonth={handleSwitchToCurrentMonth}
        />
      )}
    </div>
  );
}

export default App;