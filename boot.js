/* Dingel Hafizia — deterministic startup controller */
(() => {
  const login = document.getElementById("loginScreen");
  const app = document.getElementById("app");
  const view = document.getElementById("view");
  const recovery = document.getElementById("bootRecovery");
  const errorBox = document.getElementById("bootError");

  const showLogin = () => {
    login?.classList.remove("hidden");
    app?.classList.add("hidden");
  };

  const showApp = () => {
    login?.classList.add("hidden");
    app?.classList.remove("hidden");
    window.__dhBootOK?.();
  };

  showLogin();

  window.addEventListener("dh:logout", showLogin);

  window.addEventListener("dh:auth", () => {
    let tries = 0;
    const check = () => {
      tries += 1;
      const ready = !!(view?.children?.length && document.querySelector("#nav .nav-btn"));
      if (ready) return showApp();
      if (tries < 80) return setTimeout(check, 100);
      if (errorBox) errorBox.textContent = "Application modules did not finish loading.";
      recovery?.classList.add("show");
    };
    check();
  });
})();
