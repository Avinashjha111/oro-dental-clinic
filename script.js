/* =========================================================
   Oro Dental Care ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â shared interactions
   Mobile navigation, scroll reveals and appointment validation
   ========================================================= */

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  // Add a small shadow to the fixed header once the page begins to scroll.
  const updateHeader = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Open and close the mobile navigation while keeping ARIA state in sync.
  const closeMenu = () => {
    if (!menuToggle || !navLinks) return;
    menuToggle.classList.remove("open");
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  // Reveal content as it enters the viewport; gracefully show all if unsupported.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -25px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  // Keep copyright years current without requiring annual HTML edits.
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  setupAppointmentForm();
  setupMobileDashboard();
});

/** Configure date rules, query-string service selection and form validation. */
function setupAppointmentForm() {
  const form = document.getElementById("appointmentForm");
  if (!form) return;

  const successMessage = document.getElementById("successMessage");
  const dateInput = document.getElementById("preferredDate");
  const serviceSelect = document.getElementById("service");
  const today = getLocalDateString(new Date());

  // Prevent a preferred date in the past.
  dateInput.min = today;

  // Preselect a treatment when arriving from a service card.
  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (requestedService) {
    const matchingOption = Array.from(serviceSelect.options).find(
      (option) => option.text.toLowerCase() === requestedService.toLowerCase()
    );
    if (matchingOption) serviceSelect.value = matchingOption.value;
  }

  const fields = Array.from(form.querySelectorAll(".form-control"));

  fields.forEach((field) => {
    const clearErrorIfValid = () => {
      if (isFieldValid(field, today)) {
        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
      }
    };
    field.addEventListener("input", clearErrorIfValid);
    field.addEventListener("change", clearErrorIfValid);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.classList.remove("show");

    let firstInvalidField = null;
    fields.forEach((field) => {
      const isValid = isFieldValid(field, today);
      field.classList.toggle("invalid", !isValid);
      if (!isValid) {
        field.setAttribute("aria-invalid", "true");
        if (!firstInvalidField) firstInvalidField = field;
      } else {
        field.removeAttribute("aria-invalid");
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    // Demo-only submission: no data is sent to a server.
    form.reset();
    successMessage.classList.add("show");
    successMessage.focus();
  });
}

/** Validate a single form control, including the custom no-past-date rule. */
function isFieldValid(field, today) {
  if (field.id === "preferredDate" && field.value && field.value < today) return false;
  if (field.id === "phone") {
    return /^[6-9][0-9]{9}$/.test(field.value.trim());
  }
  if (field.id === "email" && field.value.trim() === "") return true;
  return field.checkValidity();
}

/** Return YYYY-MM-DD in the visitor's local time zone. */
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setupMobileDashboard() {
  const app = document.getElementById("mobileApp"); if (!app) return;
  const drawer = document.getElementById("homeDrawer"), backdrop = document.getElementById("drawerBackdrop"), trigger = document.getElementById("drawerOpen");
  const setDrawer = (open) => { drawer.classList.toggle("open", open); backdrop.classList.toggle("open", open); drawer.setAttribute("aria-hidden", String(!open)); trigger.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("yd-drawer-open", open); };
  trigger.addEventListener("click", () => setDrawer(true)); document.getElementById("drawerClose").addEventListener("click", () => setDrawer(false)); backdrop.addEventListener("click", () => setDrawer(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setDrawer(false); });
  const routes = ["dashboard", "projects", "qr", "templates", "automation"];
  const route = () => { const active = routes.includes(location.hash.slice(1)) ? location.hash.slice(1) : "dashboard"; app.querySelectorAll("[data-view]").forEach(v => v.hidden = v.dataset.view !== active); app.querySelectorAll("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === active)); setDrawer(false); };
  addEventListener("hashchange", route); route();
  const copy = document.getElementById("copyWba"); copy.addEventListener("click", async () => { const label = copy.querySelector("span"), old = label.textContent; try { await navigator.clipboard.writeText(copy.dataset.copy); label.textContent = "WBA ID copied"; setTimeout(() => label.textContent = old, 1400); } catch (_) { label.textContent = "WBA-918765432100"; } });
  const input = document.getElementById("qrMessage"), canvas = document.getElementById("qrCanvas"), status = document.getElementById("qrStatus");
  const draw = () => { const c = canvas.getContext("2d"), cells = 29, size = canvas.width / cells, value = "https://wa.me/919876543210?text=" + encodeURIComponent(input.value.trim()); let hash = 2166136261; for (let i=0;i<value.length;i++) hash=Math.imul(hash^value.charCodeAt(i),16777619); c.fillStyle="#fff"; c.fillRect(0,0,canvas.width,canvas.height); for(let y=0;y<cells;y++) for(let x=0;x<cells;x++){ const f=(x<7&&y<7)||(x>21&&y<7)||(x<7&&y>21), mx=x%22,my=y%22, fd=f&&(mx===0||my===0||mx===6||my===6||(mx>1&&mx<5&&my>1&&my<5)), d=!f&&((Math.imul(x+3,y+7)^hash^(hash>>>((x+y)%16)))&1); if(fd||d){c.fillStyle="#10243e";c.fillRect(Math.floor(x*size),Math.floor(y*size),Math.ceil(size),Math.ceil(size));}} status.textContent=input.value.trim()?"Preview updated":"Add a message to continue"; };
  input.addEventListener("input", draw); document.getElementById("generateQr").addEventListener("click",()=>{draw();status.textContent="QR generated successfully";}); draw();
}
