import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginScreen = document.getElementById("loginScreen");
const appRoot = document.getElementById("app");
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");

function showError(message) {
  if (loginError) {
    loginError.textContent = message;
    loginError.className = "error-text";
  }
}

function setLoggedIn(user) {
  if (user) {
    loginScreen?.classList.add("hidden");
    appRoot?.classList.remove("hidden");
    window.dispatchEvent(new CustomEvent("dh:auth", { detail: user }));
  } else {
    loginScreen?.classList.remove("hidden");
    appRoot?.classList.add("hidden");
    window.dispatchEvent(new CustomEvent("dh:logout"));
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput?.value.trim();
  const password = passwordInput?.value || "";
  if (!email || !password) return;
  const button = form.querySelector("button[type=submit]");
  if (button) { button.disabled = true; button.textContent = "Signing in…"; }
  showError("");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const messages = {
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/too-many-requests": "Too many attempts. Please try again later."
    };
    showError(messages[error?.code] || "Login failed. Please check Firebase Authentication.");
  } finally {
    if (button) { button.disabled = false; button.textContent = "Login"; }
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try { await signOut(auth); } catch (error) { console.error(error); }
});

onAuthStateChanged(auth, setLoggedIn);

export { auth };