function applyStudentsDetailsLabel(){
  if(document.getElementById("pageTitle")?.textContent==="Students" ) document.getElementById("pageTitle").textContent="Students Details";
  document.querySelectorAll("#nav .nav-btn").forEach(b=>{if(b.dataset.page==="students"){const s=b.querySelector("span:last-child");if(s)s.textContent="Students Details";}});
  document.querySelectorAll("h3").forEach(h=>{if(h.textContent.trim()==="Student Directory")h.textContent="Students Details";});
}
new MutationObserver(applyStudentsDetailsLabel).observe(document.body,{childList:true,subtree:true});
window.addEventListener("dh:auth",()=>setTimeout(applyStudentsDetailsLabel,50));
setTimeout(applyStudentsDetailsLabel,100);
