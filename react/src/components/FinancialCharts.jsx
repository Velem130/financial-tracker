import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

function FinancialCharts({ transactions }) {
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [yearlySummary, setYearlySummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Process chart data when transactions change
  useEffect(() => {
    processChartData();
  }, [transactions]);

  const processChartData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      if (!transactions || transactions.length === 0) {
        // No transactions yet
        setMonthlyData([]);
        setExpenseData([]);
        setIncomeData([]);
        setYearlySummary({
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0
        });
        return;
      }
      
      // Filter transactions for current year
      const currentYearTransactions = transactions.filter(t => 
        t.monthYear && t.monthYear.startsWith(currentYear.toString())
      );
      
      // 1. Process monthly data
      const monthly = [];
      for (let i = 0; i < 12; i++) {
        const monthNum = i + 1;
        const monthKey = `${currentYear}-${String(monthNum).padStart(2, '0')}`;
        const monthTransactions = currentYearTransactions.filter(t => t.monthYear === monthKey);
        
        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const monthName = new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' });
        
        monthly.push({
          name: monthName,
          monthKey,
          income: monthIncome,
          expenses: monthExpenses,
          balance: monthIncome - monthExpenses
        });
      }
      setMonthlyData(monthly);
      
      // 2. Process category data for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const currentMonthTransactions = currentYearTransactions.filter(
        t => t.monthYear === currentMonth
      );
      
      const categoryMap = { income: {}, expense: {} };
      currentMonthTransactions.forEach(transaction => {
        const type = transaction.type;
        const category = transaction.category || 'Uncategorized';
        
        if (!categoryMap[type][category]) {
          categoryMap[type][category] = 0;
        }
        categoryMap[type][category] += parseFloat(transaction.amount);
      });
      
      const expenseCategories = Object.entries(categoryMap.expense).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
      
      const incomeCategories = Object.entries(categoryMap.income).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
      
      setExpenseData(expenseCategories);
      setIncomeData(incomeCategories);
      
      // 3. Calculate yearly summary
      const totalIncome = currentYearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const totalExpenses = currentYearTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      setYearlySummary({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      });
      
    } catch (error) {
      console.error('Error processing chart data:', error);
      setError(error.message || 'Failed to process chart data');
    } finally {
      setLoading(false);
    }
  }, [transactions, currentYear]);

  // Custom label for mobile - shorter format
  const renderCustomLabel = ({ name, percent }) => {
    if (window.innerWidth < 640) {
      return `${(percent * 100).toFixed(0)}%`;
    }
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Processing chart data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Monthly Income vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
          {currentYear} Monthly Overview
        </h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={window.innerWidth < 640 ? 1 : 0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`R${value.toFixed(2)}`, 'Amount']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: '14px' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Expense Categories Pie Chart */}
      {expenseData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
            Expense Categories (Current Month)
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`R${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend for mobile */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            {expenseData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Income Categories Pie Chart */}
      {incomeData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
            Income Sources (Current Month)
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`R${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend for mobile */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            {incomeData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Yearly Summary */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
          {currentYear} Yearly Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs md:text-sm text-green-600 mb-1">Total Income</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              R{yearlySummary.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-xs md:text-sm text-red-600 mb-1">Total Expenses</p>
            <p className="text-xl md:text-2xl font-bold text-red-700">
              R{yearlySummary.totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${yearlySummary.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className={`text-xs md:text-sm mb-1 ${yearlySummary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Yearly Balance
            </p>
            <p className={`text-xl md:text-2xl font-bold ${yearlySummary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              R{yearlySummary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialCharts;