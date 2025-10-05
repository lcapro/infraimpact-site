// Inject email/phone, theme toggle
(function(){
  const at = "@", dot = ".";
  const u = "jim.vanderkooij";
  const d = "infraimpact"; const tld = "nl";
  const email = u + at + d + dot + tld;

  const ems = document.querySelectorAll("[data-email]");
  ems.forEach(el => {
    el.textContent = email;
    if (el.tagName === "A") { el.href = "mailto:" + email + "?subject=Kennismaking%20InfraImpact"; }
  });

  const phoneDisp = "+31 (0)6 2135 0805";
  const phoneRaw = "+31621350805";
  const phoneEls = document.querySelectorAll("[data-phone]");
  phoneEls.forEach(el => {
    el.textContent = phoneDisp;
    if (el.tagName === "A") el.href = "tel:" + phoneRaw;
  });

  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle){
    toggle.addEventListener("click", ()=>{
      const current = document.documentElement.dataset.theme || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      toggle.setAttribute("aria-label", "Schakel naar " + (next === "dark" ? "licht" : "donker") + " thema");
    });
  }
})();