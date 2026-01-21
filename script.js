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

  const epdForm = document.querySelector("#epd-database-form");
  const epdModal = document.querySelector("#epd-modal");
  const epdOpenButtons = document.querySelectorAll("[data-epd-open]");
  const epdCloseButtons = document.querySelectorAll("[data-epd-close]");
  const epdSuccess = document.querySelector("#epd-success");
  const epdError = document.querySelector("#epd-form-error");
  const epdSubmitButton = epdForm?.querySelector("button[type='submit']");
  const epdFirstInput = epdForm?.querySelector("input[name='voornaam']");
  let lastFocusedElement = null;
  let isSubmitting = false;

  const resetEpdState = () => {
    if (epdError) epdError.classList.add("hidden");
    if (epdSuccess) epdSuccess.classList.add("hidden");
    if (epdForm) epdForm.classList.remove("hidden");
    if (epdSubmitButton) epdSubmitButton.disabled = false;
    isSubmitting = false;
  };

  const toggleEpdModal = (isOpen) => {
    if (!epdModal) return;
    if (isOpen) {
      lastFocusedElement = document.activeElement;
      resetEpdState();
    }
    epdModal.classList.toggle("hidden", !isOpen);
    epdModal.classList.toggle("flex", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen && epdFirstInput) {
      epdFirstInput.focus();
    }
    if (!isOpen && lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  epdOpenButtons.forEach((button) => {
    button.addEventListener("click", () => toggleEpdModal(true));
  });

  epdCloseButtons.forEach((button) => {
    button.addEventListener("click", () => toggleEpdModal(false));
  });

  if (epdModal){
    epdModal.addEventListener("click", (event) => {
      if (event.target === epdModal){
        toggleEpdModal(false);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && epdModal && !epdModal.classList.contains("hidden")){
      toggleEpdModal(false);
    }
  });

  if (epdForm){
    epdForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      if (epdError) epdError.classList.add("hidden");
      const formData = new FormData(epdForm);
      const honeypot = formData.get("website");
      if (honeypot) {
        epdForm.reset();
        if (epdForm) epdForm.classList.add("hidden");
        if (epdSuccess) epdSuccess.classList.remove("hidden");
        return;
      }
      formData.append("sourcePage", window.location.href);
      isSubmitting = true;
      if (epdSubmitButton) epdSubmitButton.disabled = true;
      try {
        const response = await fetch("https://formspree.io/f/xdaayblp", {
          method: "POST",
          headers: {
            "Accept": "application/json"
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error("Formspree error");
        }
        epdForm.reset();
        if (epdForm) epdForm.classList.add("hidden");
        if (epdSuccess) epdSuccess.classList.remove("hidden");
      } catch (error) {
        if (epdError) epdError.classList.remove("hidden");
      } finally {
        isSubmitting = false;
        if (epdSubmitButton) epdSubmitButton.disabled = false;
      }
    });
  }
})();
