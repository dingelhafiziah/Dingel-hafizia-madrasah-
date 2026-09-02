import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginScreen = document.getElementById("loginScreen");
const appRoot = document.getElementById("app");
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");

function showError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.className = "error-text";
}

function setLoggedIn(user) {
  if (user) {
    // Keep the login screen visible until app.js confirms that the application
    // shell has initialized. This prevents a module/runtime error from leaving
    // GitHub Pages on a completely blank screen.
    window.dispatchEvent(new CustomEvent("dh:auth", { detail: user }));
  } else {
    loginScreen?.classList.remove("hidden");
    appRoot?.classList.add("hidden");
    window.dispatchEvent(new CustomEvent("dh:logout"));
  }
}

function firebaseLoginMessage(error) {
  const messages = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/user-not-found": "No Firebase Authentication account exists for this email.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This Firebase account has been disabled.",
    "auth/too-many-requests": "Too many login attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password sign-in is disabled in Firebase Authentication.",
    "auth/configuration-not-found": "Firebase Authentication is not configured for this project."
  };
  return messages[error?.code] || `Login failed (${error?.code || "unknown error"}).`;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput?.value.trim() || "";
  const password = passwordInput?.value || "";
  if (!email || !password) return;

  const button = form.querySelector("button[type=submit]");
  if (button) { button.disabled = true; button.textContent = "Signing in…"; }
  showError("");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Firebase login error:", error);
    showError(firebaseLoginMessage(error));
  } finally {
    if (button) { button.disabled = false; button.textContent = "Login"; }
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try { await signOut(auth); }
  catch (error) { console.error("Firebase logout error:", error); }
});

onAuthStateChanged(auth, setLoggedIn);

export { auth };