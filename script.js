
// Email anti-scrape + theme toggle
(function(){
  const at = "@", dot = ".";
  const u = "jim.vanderkooij";
  const d = "infraimpact"; const tld = "nl";
  const email = u + at + d + dot + tld;

  const ems = document.querySelectorAll("[data-email]");
  ems.forEach(el => {
    el.textContent = email;
    if (el.tagName === "A") { el.href = "mailto:" + email + "?subject=Contact%20via%20website"; }
  });

  // phone
  const phone = "+31621350805";
  const phoneEls = document.querySelectorAll("[data-phone]");
  phoneEls.forEach(el => {
    el.textContent = "+31 (0)6 2135 0805";
    if (el.tagName === "A") el.href = "tel:" + phone;
  });

  // theme toggle (prefers-color-scheme aware)
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
