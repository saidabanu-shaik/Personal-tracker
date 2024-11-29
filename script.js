document.getElementById('transaction-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const type = document.getElementById('type').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;

  if (!validatePositiveNumber(amount)) {
      alert('Amount must be a positive number.');
      return;
  }

  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.push({ type, amount, date, category });
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateUI();
  this.reset();
  showSuccessMessage('Transaction added successfully.');
});

document.getElementById('set-budget').addEventListener('click', function() {
  const monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 0;
  const monthlyExpense = parseFloat(document.getElementById('monthly-expense').value) || 0;

  if (!validatePositiveNumber(monthlyIncome) || !validatePositiveNumber(monthlyExpense)) {
      alert('Monthly Income and Expense must be positive numbers.');
      return;
  }

  localStorage.setItem('monthly-income', monthlyIncome);
  localStorage.setItem('monthly-expense', monthlyExpense);
  updateBudgetStatus();
  showSuccessMessage('Budget set successfully.');
});

document.getElementById('toggle-dark-mode').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});

function validatePositiveNumber(value) {
  return value > 0;
}

function showSuccessMessage(message) {
  alert(message);
}

function updateUI() {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const tbody = document.querySelector('#transactions-table tbody');
  tbody.innerHTML = '';

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${transaction.date}</td>
          <td>${transaction.category}</td>
          <td>₹${transaction.amount.toFixed(2)}</td>
          <td>${transaction.type}</td>
          <td>
              <button onclick="editTransaction(${index})">Edit</button>
              <button onclick="deleteTransaction(${index})">Delete</button>
          </td>
      `;
      tbody.appendChild(row);

      if (transaction.type === 'income') {
          totalIncome += transaction.amount;
      } else {
          totalExpenses += transaction.amount;
      }
  });

  document.getElementById('total-income').textContent = `Total Income: ₹${totalIncome.toFixed(2)}`;
  document.getElementById('total-expenses').textContent = `Total Expenses: ₹${totalExpenses.toFixed(2)}`;
  document.getElementById('savings').textContent = `Savings: ₹${(totalIncome - totalExpenses).toFixed(2)}`;

  updateBudgetStatus();
  updateChart(transactions);
}

function editTransaction(index) {
  const transactions = JSON.parse(localStorage.getItem('transactions'));
  const transaction = transactions[index];

  document.getElementById('type').value = transaction.type;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('date').value = transaction.date;
  document.getElementById('category').value = transaction.category;

  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateUI();
}

function deleteTransaction(index) {
  if (confirm('Are you sure you want to delete this transaction?')) {
      const transactions = JSON.parse(localStorage.getItem('transactions'));
      transactions.splice(index, 1);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      updateUI();
      showSuccessMessage('Transaction deleted successfully.');
  }
}

function updateBudgetStatus() {
  const monthlyExpense = parseFloat(localStorage.getItem('monthly-expense')) || 0;
  const totalExpenses = parseFloat(document.getElementById('total-expenses').textContent.replace(/[^0-9.-]+/g, "")) || 0;

  const budgetStatus = document.getElementById('budget-status');
  if (totalExpenses > monthlyExpense) {
      budgetStatus.textContent = 'Budget Status: Overspent';
      budgetStatus.style.color = 'red';
  } else if (totalExpenses > monthlyExpense * 0.8) {
      budgetStatus.textContent = 'Budget Status: Approaching Limit';
      budgetStatus.style.color = 'orange';
  } else {
      budgetStatus.textContent = 'Budget Status: Within Budget';
      budgetStatus.style.color = 'green';
  }
}

function updateChart(transactions) {
  const ctx = document.getElementById('expenses-chart').getContext('2d');
  const categories = {};
  
  // transactions.forEach(transaction => {
  //     if (transaction.type === 'expense') {
  //         categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
  //     }
  // });

  // Separate income and expenses into categories
  transactions.forEach(transaction => {
    const key = transaction.type === 'income' ? 'Income' : transaction.category;
    if (!categories[key]) {
        categories[key] = 0;
    }
    categories[key] += transaction.amount;
});

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  // Define colors for the datasets
  // const backgroundColors = labels.map(label => label === 'Income' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)' );

  // Generate distinct colors for each category
  const backgroundColors = labels.map((label, index) => {
    if (label === 'Income') {
        return 'rgb(170, 51, 106)'; // Color for income
    } else {
        // Generate a color for expenses
        const hue = (index * 360 / labels.length) % 360; // Distinct hue based on index
        return `hsl(${hue}, 70%, 50%)`; // HSL color for each category
    }
});
  

  // Clear the previous chart if exists
  if (window.expensesChart) {
      window.expensesChart.destroy();
  }

  window.expensesChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Income and Expenses by Category',
              data: data,
              backgroundColor: backgroundColors,
          }],
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
              }
          },
          plugins: {
              tooltip: {
                  callbacks: {
                      label: function(tooltipItem) {
                          return `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`;
                      }
                  }
              }
          }
      }
  });
}

// Load transactions on page load
window.onload = function() {
  updateUI();
  updateBudgetStatus();
};


