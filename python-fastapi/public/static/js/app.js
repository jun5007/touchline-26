/* Shared navigation and feedback behavior. */
(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const willOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(willOpen));
      nav.classList.toggle("is-open", willOpen);
      const label = toggle.querySelector(".sr-only");
      if (label) label.textContent = willOpen ? "메뉴 닫기" : "메뉴 열기";
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  function showToast(message, duration = 2600) {
    const region = document.querySelector(".toast-region");
    if (!region || !message) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = String(message);
    region.append(toast);
    window.setTimeout(() => toast.remove(), duration);
  }

  window.Touchline = Object.freeze({ showToast });
})();
