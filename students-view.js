import { getCollection, deleteDocument } from "./firestore.js";

const view = document.getElementById("view");
let sortMode = "class";
let rollMap = new Map();
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

async function loadRolls() {
  try { const rows = await getCollection("students"); rollMap = new Map(rows.map(s => [String(s.studentId || ""), s.roll || ""])); enhance(); }
  catch (e) { console.error("Roll data load failed", e); }
}

function addRollField() {
  const form=document.getElementById("studentForm"); if(!form||form.querySelector('[name="roll"]'))return;
  const grid=form.querySelector(".student-form-grid"); if(!grid)return;
  const sid=form.querySelector('[name="studentId"]')?.value||"";
  const field=document.createElement("div"); field.className="form-group";
  field.innerHTML=`<label>Roll Number</label><input name="roll" type="number" min="1" inputmode="numeric" placeholder="Enter roll number" value="${esc(rollMap.get(sid)||"")}">`;
  const cf=grid.querySelector('[name="class"]')?.closest(".form-group"); if(cf?.nextElementSibling)cf.parentElement.insertBefore(field,cf.nextElementSibling);else grid.prepend(field);
}

function enhanceStudentTable(){
  const table=view.querySelector(".student-table"); if(!table||table.dataset.enhanced==="1")return;
  table.dataset.enhanced="1"; const head=table.querySelector("thead tr"),body=table.querySelector("tbody"); if(!head||!body)return;
  const selectTh=document.createElement("th"); selectTh.innerHTML='<input id="selectAllStudents" type="checkbox" aria-label="Select all students">'; head.insertBefore(selectTh,head.firstChild);
  const rollTh=document.createElement("th"); rollTh.textContent="Roll"; head.insertBefore(rollTh,head.children[2]);
  [...body.querySelectorAll("tr")].forEach(row=>{
    if(row.children.length<5)return;
    const sid=row.querySelector(".student-meta")?.textContent?.replace(/^ID:\s*/i,"").trim()||"";
    const cell=document.createElement("td"); cell.innerHTML=`<input class="student-select" type="checkbox" value="${esc(sid)}" aria-label="Select student">`; row.insertBefore(cell,row.firstChild);
    const rollCell=document.createElement("td"); rollCell.className="student-roll-cell"; const roll=rollMap.get(sid)||""; rollCell.textContent=roll||"—"; row.insertBefore(rollCell,row.children[2]); row.dataset.roll=roll;
  });
  document.getElementById("selectAllStudents")?.addEventListener("change",e=>{view.querySelectorAll(".student-select").forEach(c=>c.checked=e.target.checked);updateBulkBar()});
  view.querySelectorAll(".student-select").forEach(c=>c.addEventListener("change",updateBulkBar));
}

function addViewControls(){
  const toolbar=view.querySelector(".student-toolbar"); if(!toolbar||toolbar.querySelector("[data-student-sort-wrap]"))return;
  const wrap=document.createElement("div"); wrap.dataset.studentSortWrap="1"; wrap.style.cssText="display:flex;gap:6px;align-items:center;flex:0 0 auto";
  wrap.innerHTML='<button type="button" class="btn primary" data-student-sort="class">Class-wise</button><button type="button" class="btn secondary" data-student-sort="roll">Roll-wise</button>';
  toolbar.appendChild(wrap); wrap.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>sortTable(b.dataset.studentSort)));
  const bar=document.createElement("div"); bar.id="studentBulkBar"; bar.style.cssText="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:-3px 0 12px;padding:9px 11px;background:#fff7e6;border:1px solid #ead9aa;border-radius:10px";
  bar.innerHTML='<strong id="selectedStudentCount">0 selected</strong><button id="deleteSelectedStudents" type="button" class="btn danger" disabled>🗑 Delete Selected</button><button id="clearStudentSelection" type="button" class="btn outline">Clear Selection</button>';
  toolbar.parentElement.insertBefore(bar,toolbar.nextSibling);
  document.getElementById("clearStudentSelection")?.addEventListener("click",()=>{view.querySelectorAll(".student-select").forEach(c=>c.checked=false);const a=document.getElementById("selectAllStudents");if(a)a.checked=false;updateBulkBar()});
  document.getElementById("deleteSelectedStudents")?.addEventListener("click",deleteSelected);
}

function updateBulkBar(){const checks=[...view.querySelectorAll(".student-select:checked")],count=document.getElementById("selectedStudentCount"),btn=document.getElementById("deleteSelectedStudents");if(count)count.textContent=`${checks.length} selected`;if(btn)btn.disabled=!checks.length;const all=view.querySelectorAll(".student-select");const master=document.getElementById("selectAllStudents");if(master)master.checked=all.length>0&&checks.length===all.length;}

async function deleteSelected(){
  const checks=[...view.querySelectorAll(".student-select:checked")]; if(!checks.length)return;
  const ids=checks.map(c=>c.value).filter(Boolean); if(!confirm(`${ids.length} জন student permanently delete করবেন? এই কাজ Undo করা যাবে না.`))return;
  const btn=document.getElementById("deleteSelectedStudents"); try{btn.disabled=true;btn.textContent="Deleting…";await Promise.all(ids.map(id=>{const s=window.__dhStudents?.find(x=>String(x.studentId||"")===id);return s?.id?deleteDocument("students",s.id):null}));toast(`${ids.length} জন student deleted successfully.`);window.dispatchEvent(new CustomEvent("dh:students-changed"));}catch(e){console.error(e);toast("Some students could not be deleted. Check permissions.",true)}finally{btn.disabled=false;btn.textContent="🗑 Delete Selected"}}

function sortTable(mode){const table=view.querySelector(".student-table"),body=table?.querySelector("tbody");if(!body)return;const rows=[...body.querySelectorAll("tr")].filter(r=>r.children.length>=7);rows.sort((a,b)=>{const ca=a.children[3]?.textContent.trim()||"",cb=b.children[3]?.textContent.trim()||"",ra=Number(a.dataset.roll||0),rb=Number(b.dataset.roll||0);if(mode==="roll")return(ra||999999)-(rb||999999)||ca.localeCompare(cb,"bn",{numeric:true});return ca.localeCompare(cb,"bn",{numeric:true})||(ra||999999)-(rb||999999)});rows.forEach(r=>body.appendChild(r));sortMode=mode;view.querySelectorAll("[data-student-sort]").forEach(b=>b.classList.toggle("primary",b.dataset.studentSort===mode));}
function enhance(){addRollField();addViewControls();enhanceStudentTable();if(sortMode)setTimeout(()=>sortTable(sortMode),0)}
document.addEventListener("submit",event=>{if(event.target?.id!=="studentForm")return;const roll=event.target.querySelector('[name="roll"]');if(roll)roll.value=roll.value.trim()},true);
new MutationObserver(enhance).observe(view,{childList:true,subtree:true});
window.addEventListener("dh:auth",()=>{setTimeout(enhance,150);setTimeout(loadRolls,250)});
setTimeout(()=>{enhance();loadRolls()},300);
