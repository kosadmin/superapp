// === PUT YOUR APPSCRIPT WEB APP URL HERE ===
const API_URL = "REPLACE_WITH_YOUR_APPSCRIPT_URL";

async function api(action, data = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data })
  });
  return await res.json();
}

// session helpers
function saveSession(token) {
  localStorage.setItem("session_token", token);
}
function getSession() {
  return localStorage.getItem("session_token");
}
function clearSession() {
  localStorage.removeItem("session_token");
  localStorage.removeItem("remember_me");
}

// called on pages that require authentication
async function checkLogin() {
  const token = getSession();
  if (!token) {
    window.location.href = "login.html";
    return false;
  }

  const res = await api("validate", { token });

  if (!res || !res.valid) {
    clearSession();
    window.location.href = "login.html";
    return false;
  }

  // valid: return username if needed
  return res.username || true;
}

async function logout() {
  const token = getSession();
  if (token) {
    try { await api("logout", { token }); } catch (e) { /* ignore */ }
  }
  clearSession();
  window.location.href = "login.html";
}
