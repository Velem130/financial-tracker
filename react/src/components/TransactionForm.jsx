import React, { useState } from 'react';

function TransactionForm({ onAddTransaction }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      description,
      type,
      category,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    onAddTransaction(transaction);
    
    // Reset form
    setAmount('');
    setDescription('');
    setType('expense');
    setCategory('food');
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(categories.income[0]);
                }}
                className={`px-4 py-2 rounded-lg flex-1 ${type === 'income' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800'} border`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(categories.expense[0]);
                }}
                className={`px-4 py-2 rounded-lg flex-1 ${type === 'expense' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800'} border`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories[type].map(cat => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What was this for?"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;