import { getCollection } from "./firestore.js";

const view = document.getElementById("view");
const nav = document.getElementById("nav");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

const pages = [
  ["dashboard", "⌂", "Dashboard", "মাদ্রাসার সামগ্রিক তথ্য"],
  ["students", "👨‍🎓", "Students", "শিক্ষার্থীদের তথ্য"],
  ["fees", "৳", "Fees", "ফি ও বকেয়া"],
  ["income", "＋", "Income", "মাদ্রাসার আয়"],
  ["expenses", "−", "Expenses", "মাদ্রাসার খরচ"],
  ["accounts", "▣", "Accounts", "হিসাবের সারাংশ"],
  ["reports", "▤", "Reports", "রিপোর্ট"],
  ["settings", "⚙", "Settings", "মাদ্রাসার সেটিংস"]
];

function money(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function renderNav(active = "dashboard") {
  nav.innerHTML = pages.map(([id, icon, title]) =>
    `<button class="nav-btn ${id === active ? "active" : ""}" data-page="${id}" type="button"><span class="icon">${icon}</span><span>${title}</span></button>`
  ).join("");
  nav.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.page)));
}

async function dashboard() {
  let students = [], fees = [], income = [], expenses = [];
  try {
    [students, fees, income, expenses] = await Promise.all([
      getCollection("students"), getCollection("fees"), getCollection("income"), getCollection("expenses")
    ]);
  } catch (error) {
    console.error("Firestore read failed:", error);
  }
  const totalIncome = income.reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalExpense = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalDue = fees.reduce((s, x) => s + Number(x.due || 0), 0);
  view.innerHTML = `
    <div class="content">
      <div class="page-header"><div><h3>Dashboard</h3><p>ডিঙ্গেল হাফিজিয়া মাদ্রাসা</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👨‍🎓</div><h4>Total Students</h4><strong>${students.length}</strong></div>
        <div class="stat-card"><div class="stat-icon">৳</div><h4>Total Fees Due</h4><strong>₹${money(totalDue)}</strong></div>
        <div class="stat-card"><div class="stat-icon">＋</div><h4>Total Income</h4><strong>₹${money(totalIncome)}</strong></div>
        <div class="stat-card"><div class="stat-icon">−</div><h4>Total Expense</h4><strong>₹${money(totalExpense)}</strong></div>
      </div>
      <div class="dashboard-grid">
        <div class="card"><div class="card-header"><h3>Quick Overview</h3></div><div class="card-body"><p class="text-muted">Firebase connection is active. Use the menu to manage the madrasa data.</p></div></div>
        <div class="card"><div class="card-header"><h3>Balance</h3></div><div class="card-body"><strong style="font-size:26px">₹${money(totalIncome - totalExpense)}</strong><p class="text-muted">Income − Expense</p></div></div>
      </div>
    </div>`;
}

async function simpleList(collectionName, title, subtitle) {
  let rows = [];
  try { rows = await getCollection(collectionName); } catch (error) { console.error(error); }
  const columns = collectionName === "students" ? ["name", "class", "phone", "guardian", "status"] : ["date", "amount", "category", "description"];
  const body = rows.length ? rows.map((row) => `<tr>${columns.map((key) => `<td>${String(row[key] ?? "—")}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length}" class="empty-state">No records found</td></tr>`;
  view.innerHTML = `<div class="content"><div class="page-header"><div><h3>${title}</h3><p>${subtitle}</p></div></div><div class="card"><div class="card-body"><div class="table-wrap"><table><thead><tr>${columns.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div></div></div></div>`;
}

async function showPage(id) {
  const page = pages.find((x) => x[0] === id) || pages[0];
  pageTitle.textContent = page[2];
  pageSubtitle.textContent = page[3];
  renderNav(id);
  sidebar.classList.remove("open"); overlay.classList.remove("show");
  if (id === "dashboard") return dashboard();
  if (id === "students") return simpleList("students", "Students", "শিক্ষার্থীদের তালিকা");
  if (id === "fees") return simpleList("fees", "Fees", "ফি ও বকেয়া");
  if (id === "income") return simpleList("income", "Income", "মাদ্রাসার আয়");
  if (id === "expenses") return simpleList("expenses", "Expenses", "মাদ্রাসার খরচ");
  if (id === "accounts") return dashboard();
  view.innerHTML = `<div class="content"><div class="page-header"><div><h3>${page[2]}</h3><p>${page[3]}</p></div></div><div class="card"><div class="card-body empty-state"><div class="empty-icon">${page[1]}</div><h3>${page[2]}</h3><p>এই module-এর data layer প্রস্তুত আছে। পরবর্তী ধাপে বিস্তারিত management forms যোগ করা যাবে।</p></div></div></div>`;
}

document.getElementById("refreshBtn")?.addEventListener("click", () => showPage(document.querySelector(".nav-btn.active")?.dataset.page || "dashboard"));
document.getElementById("printBtn")?.addEventListener("click", () => window.print());
document.getElementById("menuBtn")?.addEventListener("click", () => { sidebar.classList.toggle("open"); overlay.classList.toggle("show"); });
overlay?.addEventListener("click", () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); });
window.addEventListener("dh:auth", () => showPage("dashboard"));
window.addEventListener("dh:logout", () => { view.innerHTML = ""; });

renderNav("dashboard");
document.getElementById("footerYear").textContent = new Date().getFullYear();
