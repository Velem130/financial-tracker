import React, { useState, useEffect } from 'react';

function BudgetTracker({ userId }) {
  const [budgets, setBudgets] = useState({});
  const [editing, setEditing] = useState(false);
  const [newBudgets, setNewBudgets] = useState({});

  // Default budget categories
  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', default: 300 },
    { id: 'transport', name: 'Transport', icon: '🚗', default: 150 },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', default: 200 },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', default: 300 },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', default: 100 },
    { id: 'health', name: 'Health', icon: '🏥', default: 100 },
    { id: 'education', name: 'Education', icon: '📚', default: 50 },
    { id: 'other', name: 'Other', icon: '📦', default: 100 },
  ];

  useEffect(() => {
    loadBudgets();
  }, [userId]);

  const loadBudgets = () => {
    const saved = localStorage.getItem(`budgets_${userId}`);
    if (saved) {
      setBudgets(JSON.parse(saved));
    } else {
      // Set defaults
      const defaultBudgets = {};
      categories.forEach(cat => {
        defaultBudgets[cat.id] = cat.default;
      });
      setBudgets(defaultBudgets);
      saveBudgets(defaultBudgets);
    }
  };

  const saveBudgets = (budgetData) => {
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(budgetData));
  };

  const handleEdit = () => {
    setNewBudgets({ ...budgets });
    setEditing(true);
  };

  const handleSave = () => {
    setBudgets(newBudgets);
    saveBudgets(newBudgets);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleBudgetChange = (categoryId, value) => {
    setNewBudgets({
      ...newBudgets,
      [categoryId]: parseFloat(value) || 0
    });
  };

  // Calculate total budget
  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Monthly Budget</h3>
        {!editing ? (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Budgets
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Total Budget */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">Total Monthly Budget</p>
        <p className="text-3xl font-bold text-blue-700">R{totalBudget.toFixed(2)}</p>
      </div>

      {/* Budget Categories */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{category.name}</p>
                <p className="text-sm text-gray-500">Monthly budget</p>
              </div>
            </div>
            
            {editing ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBudgets[category.id] || ''}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-right"
                />
              </div>
            ) : (
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  R{budgets[category.id] ? budgets[category.id].toFixed(2) : '0.00'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!editing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 Tip: Your budget automatically resets at the beginning of each month.
            Update your budgets anytime to match your financial goals.
          </p>
        </div>
      )}
    </div>
  );
}

export default BudgetTracker;