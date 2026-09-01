/* Students Details — lightweight enhancement layer */
const view = document.getElementById("view");

function enhanceStudentsPage(){
  const page=view?.querySelector(".student-table-card");
  if(!page || page.dataset.enhanced==="1") return;
  page.dataset.enhanced="1";
  const table=page.querySelector(".student-table");
  const head=table?.querySelector("thead tr");
  const body=table?.querySelector("tbody");
  if(!table||!head||!body) return;

  /* Selection */
  const selectHead=document.createElement("th");
  selectHead.innerHTML='<input id="selectAllStudents" type="checkbox" aria-label="Select all students">';
  head.insertBefore(selectHead,head.firstChild);
  [...body.querySelectorAll("tr")].forEach(row=>{
    if(row.querySelector(".student-empty")) return;
    const id=row.querySelector("[data-view], [data-edit], [data-delete]")?.dataset.view || row.querySelector("[data-edit]")?.dataset.edit || row.querySelector("[data-delete]")?.dataset.delete;
    if(!id) return;
    const cell=document.createElement("td");
    cell.innerHTML=`<input class="student-select" type="checkbox" value="${id}" aria-label="Select student">`;
    row.insertBefore(cell,row.firstChild);
  });

  const bulk=document.createElement("div");
  bulk.className="student-bulk-actions";
  bulk.innerHTML='<span id="selectedStudentCount">0 selected</span><button id="deleteSelectedStudents" class="btn danger small" type="button" disabled>🗑 Delete Selected</button><button id="clearStudentSelection" class="btn outline small" type="button">Clear</button>';
  page.querySelector(".card-body")?.insertBefore(bulk,page.querySelector(".student-table-wrap"));

  const update=()=>{
    const selected=[...view.querySelectorAll(".student-select:checked")];
    document.getElementById("selectedStudentCount").textContent=`${selected.length} selected`;
    document.getElementById("deleteSelectedStudents").disabled=selected.length===0;
    const all=[...view.querySelectorAll(".student-select")];
    document.getElementById("selectAllStudents").checked=all.length>0&&selected.length===all.length;
  };
  document.getElementById("selectAllStudents").onchange=e=>{view.querySelectorAll(".student-select").forEach(x=>x.checked=e.target.checked);update()};
  view.querySelectorAll(".student-select").forEach(x=>x.onchange=update);
  document.getElementById("clearStudentSelection").onclick=()=>{view.querySelectorAll(".student-select").forEach(x=>x.checked=false);update()};
  document.getElementById("deleteSelectedStudents").onclick=async()=>{
    const ids=[...view.querySelectorAll(".student-select:checked")].map(x=>x.value);
    const records=window.__dhStudents||[];
    if(!ids.length)return;
    if(!confirm(`${ids.length} জন student delete করবেন? এই কাজ Undo করা যাবে না.`))return;
    const btn=document.getElementById("deleteSelectedStudents");
    try{
      btn.disabled=true; btn.textContent="Deleting…";
      const {deleteDocument}=await import("./firestore.js");
      await Promise.all(ids.map(id=>deleteDocument("students",id)));
      if(typeof window.__dhReloadStudents==="function") await window.__dhReloadStudents();
      else location.reload();
    }catch(error){
      console.error(error);
      alert("Delete failed. Firebase Firestore permission check করুন.");
      btn.disabled=false; btn.textContent="🗑 Delete Selected";
    }
  };
}

const observer=new MutationObserver(()=>enhanceStudentsPage());
if(view) observer.observe(view,{childList:true,subtree:true});
window.addEventListener("dh:auth",()=>setTimeout(enhanceStudentsPage,300));
setTimeout(enhanceStudentsPage,700);
