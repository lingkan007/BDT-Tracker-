const monthSelector = document.getElementById("monthSelector");
const expenseDate = document.getElementById("expenseDate");
const category = document.getElementById("category");
const amount = document.getElementById("amount");
const note = document.getElementById("note");
const addExpenseBtn = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");
const dailyTotalEl = document.getElementById("dailyTotal");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const themeToggle = document.getElementById("themeToggle");

const STORAGE_KEY = "bdt-expenses";

/* ===== INIT ===== */
const today = new Date();
monthSelector.value = today.toISOString().slice(0, 7);
expenseDate.value = today.toISOString().slice(0, 10);

/* ===== UTIL ===== */
function formatBDT(value) {
  return `৳ ${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} BDT`;
}

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ===== LIVE DATE ===== */
function updateLiveDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  document.getElementById("liveDate").textContent =
    now.toLocaleDateString("en-GB", options);
}
updateLiveDate();
setInterval(updateLiveDate, 60000);

/* ===== CORE LOGIC ===== */
function addExpense() {
  if (!expenseDate.value || amount.value <= 0 || !category.value) {
    alert("Please fill all required fields correctly.");
    return;
  }

  const data = loadData();
  const month = expenseDate.value.slice(0, 7);
  const date = expenseDate.value;

  data[month] = data[month] || {};
  data[month][date] = data[month][date] || [];

  data[month][date].push({
    category: category.value,
    amount: Number(amount.value),
    note: note.value
  });

  saveData(data);
  amount.value = "";
  note.value = "";
  render();
}

function deleteExpense(month, date, index) {
  const data = loadData();
  data[month][date].splice(index, 1);
  if (data[month][date].length === 0) delete data[month][date];
  saveData(data);
  render();
}

function render() {
  expenseList.innerHTML = "";
  let dailyTotal = 0;
  let monthlyTotal = 0;

  const data = loadData();
  const selectedMonth = monthSelector.value;
  const selectedDate = expenseDate.value;

  if (data[selectedMonth]) {
    Object.values(data[selectedMonth]).forEach(day =>
      day.forEach(exp => monthlyTotal += exp.amount)
    );
  }

  if (data[selectedMonth]?.[selectedDate]) {
    data[selectedMonth][selectedDate].forEach((exp, i) => {
      dailyTotal += exp.amount;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${exp.category} — ${formatBDT(exp.amount)}</span>
        <button class="delete">X</button>
      `;
      li.querySelector("button").onclick = () =>
        deleteExpense(selectedMonth, selectedDate, i);
      expenseList.appendChild(li);
    });
  }

  dailyTotalEl.textContent = formatBDT(dailyTotal);
  monthlyTotalEl.textContent = formatBDT(monthlyTotal);
}

/* ===== EVENTS ===== */
addExpenseBtn.onclick = addExpense;
monthSelector.onchange = render;
expenseDate.onchange = render;
themeToggle.onclick = () => document.body.classList.toggle("dark");

render();
