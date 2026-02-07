import React, { useState, useEffect } from 'react';

function BudgetTracker({ userId }) {
  const [budgets, setBudgets] = useState({});
  const [editing, setEditing] = useState(false);
  const [newBudgets, setNewBudgets] = useState({});

  // Default budget categories with zero amounts
  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', default: 0 },
    { id: 'transport', name: 'Transport', icon: '🚗', default: 0 },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', default: 0 },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', default: 0 },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', default: 0 },
    { id: 'health', name: 'Health', icon: '🏥', default: 0 },
    { id: 'education', name: 'Education', icon: '📚', default: 0 },
    { id: 'savings', name: 'Savings', icon: '💰', default: 0 },
    { id: 'rent', name: 'Rent/Mortgage', icon: '🏠', default: 0 },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', default: 0 },
    { id: 'personal', name: 'Personal Care', icon: '💇', default: 0 },
    { id: 'pets', name: 'Pets', icon: '🐕', default: 0 },
    { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', default: 0 },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📱', default: 0 },
    { id: 'other', name: 'Other', icon: '📦', default: 0 },
  ];

  useEffect(() => {
    loadBudgets();
  }, [userId]);

  const loadBudgets = () => {
    const saved = localStorage.getItem(`budgets_${userId}`);
    if (saved) {
      setBudgets(JSON.parse(saved));
    } else {
      // Set defaults (all zero)
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

  const quickAdd = (categoryId, amount) => {
    const currentValue = newBudgets[categoryId] || 0;
    setNewBudgets({
      ...newBudgets,
      [categoryId]: currentValue + amount
    });
  };

  // Calculate total budget
  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  
  // Get active categories (non-zero budgets)
  const activeCategories = categories.filter(cat => budgets[cat.id] > 0);
  const hasActiveBudgets = activeCategories.length > 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Monthly Budget</h3>
        {!editing ? (
          <button
            onClick={handleEdit}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {hasActiveBudgets ? 'Edit Budgets' : 'Set Up Budget'}
          </button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Total Budget */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <p className="text-xs md:text-sm text-blue-600 mb-1">Total Monthly Budget</p>
        <p className="text-2xl md:text-3xl font-bold text-blue-700">R{totalBudget.toFixed(2)}</p>
        {!hasActiveBudgets && !editing && (
          <p className="text-xs text-blue-600 mt-2">👆 Click "Set Up Budget" to get started</p>
        )}
      </div>

      {/* Empty State */}
      {!hasActiveBudgets && !editing && (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📊</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Budget Set</h4>
          <p className="text-sm text-gray-600 mb-4">
            Start by setting up your monthly budget to track your spending better
          </p>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your Budget
          </button>
        </div>
      )}

      {/* Budget Categories */}
      {(hasActiveBudgets || editing) && (
        <div className="space-y-3 md:space-y-4">
          {categories.map(category => {
            const isActive = budgets[category.id] > 0 || editing;
            if (!isActive) return null;

            return (
              <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <span className="text-xl md:text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm md:text-base">{category.name}</p>
                    <p className="text-xs md:text-sm text-gray-500">Monthly budget</p>
                  </div>
                </div>
                
                {editing ? (
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-500 text-sm">R</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newBudgets[category.id] || ''}
                        onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                        className="flex-1 sm:w-32 px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    {/* Quick Add Buttons */}
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => quickAdd(category.id, 100)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAdd(category.id, 500)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAdd(category.id, 1000)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        +1000
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-base md:text-lg font-bold text-gray-800">
                      R{budgets[category.id] ? budgets[category.id].toFixed(2) : '0.00'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!editing && hasActiveBudgets && (
        <div className="mt-6 p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-xs md:text-sm text-gray-700 font-medium mb-1">Budget Tips:</p>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                <li>• Your budget automatically resets at the beginning of each month</li>
                <li>• Track your spending against these budgets in the dashboard</li>
                <li>• Update anytime to match your financial goals</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetTracker;