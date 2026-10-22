"use strict";
const login = document.getElementById("agenda-login"),
  logout = document.getElementById("agenda-logout"),
  agenda = document.getElementById("cac-agenda");
function start() {
  const token = sessionStorage.getItem("rp_admin_session");
  login.hidden = !!token;
  logout.hidden = !token;
  if (token) ReformaAgenda.mount(agenda, { scope: "admin" });
}
login.onsubmit = async (e) => {
  e.preventDefault();
  const status = document.getElementById("login-status"),
    button = login.querySelector("button");
  button.disabled = true;
  try {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(login))),
      }),
      result = await response.json();
    if (!response.ok) throw new Error("Acesso não autorizado ou indisponível.");
    sessionStorage.setItem("rp_admin_session", result.token);
    login.reset();
    start();
  } catch (e) {
    status.textContent = e.message;
  } finally {
    button.disabled = false;
  }
};
logout.onclick = () => {
  sessionStorage.removeItem("rp_admin_session");
  agenda.replaceChildren();
  start();
};
start();
