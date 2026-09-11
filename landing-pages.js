"use strict";

document.addEventListener("click", event => {
  const link = event.target.closest("a[data-whatsapp-cta]");
  if (!link || event.defaultPrevented) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: "AW-17424041657/Rb7QCI780u4cELmNt_RA"
  });
});
