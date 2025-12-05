const API_URL = "https://script.google.com/macros/s/AKfycbznXvzshJE_eEiouKp2XS8A-cMCgm1EyifCXLKmtyJJmfDBZBQvuXUqdjSJ-4e9PtRmJQ/exec"; // <--- Dán link vào đây

async function api(action, data) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...data })
  });
  return await res.json();
}

// Lưu token vào localStorage
function saveSession(token) {
  localStorage.setItem("session_token", token);
}

function getSession() {
  return localStorage.getItem("session_token");
}

async function checkLogin() {
  const token = getSession();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const res = await api("validate", { token });
  if (!res.valid) {
    localStorage.removeItem("session_token");
    window.location.href = "login.html";
  }
}

async function logout() {
  const token = getSession();
  await api("logout", { token });

  localStorage.removeItem("session_token");
  window.location.href = "login.html";
}
