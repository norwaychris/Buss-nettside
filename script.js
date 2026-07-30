/* ============================================================
   NorwayRob – buss til leie
   Skjemaet sender forespørsler til Google Sheets (Apps Script).
   ============================================================ */
const BOOKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbxqT2-OqxBV3QsVx_GSZVjzryRtSge7kChRdyXpbvvIaEZ_-7ZZC3A2AWwjVVOwpGpCsQ/exec";
const FALLBACK_EMAIL = "norwayrob@outlook.com";

const form = document.getElementById("booking-form");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");
const overlay = document.getElementById("success-overlay");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = collectData();
  submitBtn.disabled = true;
  submitBtn.textContent = "Sender…";

  try {
    if (BOOKING_ENDPOINT) {
      await sendToSheet(data);
    } else {
      openMailto(data);
    }
    form.reset();
    overlay.hidden = false;
  } catch (err) {
    console.error(err);
    showError("Noe gikk galt. Prøv igjen, eller send oss en e-post til " + FALLBACK_EMAIL + ".");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Få pris nå →";
  }
});

function collectData() {
  const data = {};
  form.querySelectorAll("input, textarea, select").forEach((el) => {
    if (!el.name) return;
    data[el.name] = (el.value || "").trim();
  });
  return data;
}

async function sendToSheet(data) {
  await fetch(BOOKING_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(data).toString(),
  });
}

function openMailto(data) {
  const lines = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  const subject = `Ny forespørsel – ${data["Anledning"] || "buss"} (${data["Navn"] || ""})`;
  const body = "Ny bussforespørsel fra nettsiden:\n\n" + lines.join("\n");
  window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("success-close").addEventListener("click", () => { overlay.hidden = true; });
overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.hidden = true; });

/* Minimum-dato = i dag */
(function setMinDates() {
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((d) => (d.min = today));
})();
