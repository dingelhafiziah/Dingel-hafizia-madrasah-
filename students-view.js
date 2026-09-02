/* Students Details — selection + floating action menu */
const view = document.getElementById("view");

function addFloatingStudentMenu(){
  if(!view || !view.querySelector(".student-table-card") || view.querySelector("#studentFloatMenu")) return;

  const wrap=document.createElement("div");
  wrap.id="studentFloatMenu";
  wrap.className="student-float-wrap";
  wrap.innerHTML=`
    <button id="studentFloatBtn" class="student-float-btn" type="button" aria-label="Student options" aria-expanded="false">☰</button>
    <div id="studentFloatPanel" class="student-float-panel" aria-hidden="true">
      <div class="student-float-head"><div><b>Student Options</b><small>শিক্ষার্থী ব্যবস্থাপনা</small></div><button id="studentFloatClose" type="button" aria-label="Close">×</button></div>
      <button class="student-float-item primary-action" data-float="add" type="button"><span>＋</span><div><b>Add Student</b><small>নতুন শিক্ষার্থী ভর্তি</small></div></button>
      <button class="student-float-item" data-float="search" type="button"><span>⌕</span><div><b>Search Student</b><small>নাম, ID, guardian বা phone</small></div></button>
      <button class="student-float-item" data-float="filter" type="button"><span>⚲</span><div><b>Filter Students</b><small>Class, Type ও Status</small></div></button>
      <button class="student-float-item" data-float="select" type="button"><span>☑</span><div><b>Select Students</b><small>একাধিক record নির্বাচন</small></div></button>
      <button class="student-float-item" data-float="refresh" type="button"><span>↻</span><div><b>Refresh</b><small>সর্বশেষ student data</small></div></button>
      <button class="student-float-item danger-action" data-float="delete" type="button"><span>🗑</span><div><b>Delete Selected</b><small>নির্বাচিত record মুছে দিন</small></div></button>
    </div>`;
  view.appendChild(wrap);

  const btn=wrap.querySelector("#studentFloatBtn"),panel=wrap.querySelector("#studentFloatPanel");
  const close=()=>{panel.classList.remove("open");panel.setAttribute("aria-hidden","true");btn.setAttribute("aria-expanded","false")};
  btn.onclick=()=>{const open=panel.classList.toggle("open");panel.setAttribute("aria-hidden",String(!open));btn.setAttribute("aria-expanded",String(open))};
  wrap.querySelector("#studentFloatClose").onclick=close;
  wrap.querySelectorAll("[data-float]").forEach(item=>item.onclick=async()=>{
    const action=item.dataset.float;
    if(action==="add"){close();document.getElementById("addStudentBtn")?.click()}
    if(action==="search"){close();const x=document.getElementById("studentSearch");x?.focus();x?.scrollIntoView({behavior:"smooth",block:"center"})}
    if(action==="filter"){close();document.querySelector(".student-toolbar")?.scrollIntoView({behavior:"smooth",block:"center"})}
    if(action==="select"){close();document.getElementById("selectAllStudents")?.focus();document.querySelector(".student-bulk-actions")?.scrollIntoView({behavior:"smooth",block:"center"})}
    if(action==="refresh"){close();await window.__dhReloadStudents?.() || location.reload()}
    if(action==="delete"){close();document.getElementById("deleteSelectedStudents")?.click()}
  });
}

function enhanceStudentsPage(){
  const page=view?.querySelector(".student-table-card");
  if(!page) return;
  if(page.dataset.enhanced!=="1"){
    page.dataset.enhanced="1";
    const table=page.querySelector(".student-table");
    const head=table?.querySelector("thead tr");
    const body=table?.querySelector("tbody");
    if(!table||!head||!body) return;

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
      const count=document.getElementById("selectedStudentCount");
      const del=document.getElementById("deleteSelectedStudents");
      const all=[...view.querySelectorAll(".student-select")];
      if(count) count.textContent=`${selected.length} selected`;
      if(del) del.disabled=selected.length===0;
      const selectAll=document.getElementById("selectAllStudents");
      if(selectAll) selectAll.checked=all.length>0&&selected.length===all.length;
    };
    document.getElementById("selectAllStudents").onchange=e=>{view.querySelectorAll(".student-select").forEach(x=>x.checked=e.target.checked);update()};
    view.querySelectorAll(".student-select").forEach(x=>x.onchange=update);
    document.getElementById("clearStudentSelection").onclick=()=>{view.querySelectorAll(".student-select").forEach(x=>x.checked=false);update()};
    document.getElementById("deleteSelectedStudents").onclick=async()=>{
      const ids=[...view.querySelectorAll(".student-select:checked")].map(x=>x.value);
      if(!ids.length)return;
      if(!confirm(`${ids.length} জন student delete করবেন? এই কাজ Undo করা যাবে না.`))return;
      const b=document.getElementById("deleteSelectedStudents");
      try{
        b.disabled=true;b.textContent="Deleting…";
        const {deleteDocument}=await import("./firestore.js");
        await Promise.all(ids.map(id=>deleteDocument("students",id)));
        if(typeof window.__dhReloadStudents==="function") await window.__dhReloadStudents(); else location.reload();
      }catch(error){console.error(error);alert("Delete failed. Firebase Firestore permission check করুন.");b.disabled=false;b.textContent="🗑 Delete Selected"}
    };
  }
  addFloatingStudentMenu();
}

const observer=new MutationObserver(()=>enhanceStudentsPage());
if(view) observer.observe(view,{childList:true,subtree:true});
window.addEventListener("dh:auth",()=>setTimeout(enhanceStudentsPage,300));
setTimeout(enhanceStudentsPage,700);
