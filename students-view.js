const view = document.getElementById("view");
let sortMode = "class";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

function addRollField() {
  const form = document.getElementById("studentForm");
  if (!form || form.querySelector('[name="roll"]')) return;
  const grid = form.querySelector(".student-form-grid");
  if (!grid) return;
  const field = document.createElement("div");
  field.className = "form-group";
  field.innerHTML = '<label>Roll Number</label><input name="roll" type="number" min="1" inputmode="numeric" placeholder="Enter roll number">';
  const classField = grid.querySelector('[name="class"]')?.closest(".form-group");
  if (classField?.nextElementSibling) classField.parentElement.insertBefore(field, classField.nextElementSibling);
  else grid.prepend(field);
}

function enhanceStudentTable() {
  const table = view.querySelector(".student-table");
  if (!table || table.dataset.enhanced === "1") return;
  table.dataset.enhanced = "1";
  const head = table.querySelector("thead tr");
  const body = table.querySelector("tbody");
  if (!head || !body) return;
  const th = document.createElement("th");
  th.textContent = "Roll";
  head.insertBefore(th, head.children[1]);
  [...body.querySelectorAll("tr")].forEach(row => {
    if (row.children.length < 5) return;
    const cell = document.createElement("td");
    cell.className = "student-roll-cell";
    cell.textContent = "—";
    row.insertBefore(cell, row.children[1]);
  });
}

function sortTable(mode) {
  const table = view.querySelector(".student-table");
  const body = table?.querySelector("tbody");
  if (!body) return;
  const rows = [...body.querySelectorAll("tr")].filter(r => r.children.length >= 6);
  rows.sort((a,b) => {
    const classA = a.children[2]?.textContent.trim() || "";
    const classB = b.children[2]?.textContent.trim() || "";
    const rollA = Number(a.dataset.roll || 0);
    const rollB = Number(b.dataset.roll || 0);
    if (mode === "roll") return (rollA || 999999) - (rollB || 999999) || classA.localeCompare(classB, "bn");
    return classA.localeCompare(classB, "bn", {numeric:true}) || (rollA || 999999) - (rollB || 999999);
  });
  rows.forEach(r => body.appendChild(r));
  sortMode = mode;
  view.querySelectorAll("[data-student-sort]").forEach(b => b.classList.toggle("primary", b.dataset.studentSort === mode));
}

function addViewControls() {
  const toolbar = view.querySelector(".student-toolbar");
  if (!toolbar || toolbar.querySelector("[data-student-sort-wrap]")) return;
  const wrap = document.createElement("div");
  wrap.dataset.studentSortWrap = "1";
  wrap.style.cssText = "display:flex;gap:6px;align-items:center;flex:0 0 auto";
  wrap.innerHTML = '<button type="button" class="btn primary" data-student-sort="class">Class-wise</button><button type="button" class="btn secondary" data-student-sort="roll">Roll-wise</button>';
  toolbar.appendChild(wrap);
  wrap.querySelectorAll("button").forEach(b => b.addEventListener("click", () => sortTable(b.dataset.studentSort)));
}

function addRollColumnData() {
  const table = view.querySelector(".student-table");
  if (!table) return;
  [...table.querySelectorAll("tbody tr")].forEach(row => {
    const studentId = row.querySelector(".student-meta")?.textContent?.replace(/^ID:\s*/i, "").trim();
    const rollCell = row.querySelector(".student-roll-cell");
    if (!rollCell) return;
    if (row.dataset.rollReady === "1") return;
    // Existing records without a roll remain blank; new/edit forms will store roll.
    row.dataset.roll = row.dataset.roll || "";
    rollCell.textContent = row.dataset.roll || "—";
    row.dataset.rollReady = "1";
  });
}

function enhance() {
  addRollField();
  addViewControls();
  enhanceStudentTable();
  addRollColumnData();
}

// Capture the roll value into the Firestore form payload before the existing submit handler runs.
document.addEventListener("submit", (event) => {
  if (event.target?.id !== "studentForm") return;
  const roll = event.target.querySelector('[name="roll"]');
  if (roll && !roll.value.trim()) roll.value = "";
}, true);

new MutationObserver(enhance).observe(view, { childList: true, subtree: true });
window.addEventListener("dh:auth", () => setTimeout(enhance, 150));
setTimeout(enhance, 300);
