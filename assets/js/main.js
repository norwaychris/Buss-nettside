/* BREAKZ — shared interactions: nav, reveals, countdown, tilt, toast */

(function () {
  "use strict";

  /* ---------- navigation ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const burger = nav.querySelector(".nav-burger");
    const links = nav.querySelector(".nav-links");
    if (burger && links) {
      burger.addEventListener("click", () => {
        nav.classList.toggle("menu-open");
        links.classList.toggle("mobile-open");
      });
      links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("menu-open");
          links.classList.remove("mobile-open");
        })
      );
    }
  }

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  window.observeReveals = function (root) {
    (root || document).querySelectorAll(".reveal, .reveal-scale").forEach((el) => io.observe(el));
  };
  window.observeReveals();

  /* ---------- count-up numbers ---------- */
  const cuIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cuIO.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.countup);
        const suffix = el.dataset.suffix || "";
        const dur = 1600;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased).toLocaleString("no-NO") + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-countup]").forEach((el) => cuIO.observe(el));

  /* ---------- countdown ---------- */
  const cd = document.querySelector("[data-countdown]");
  if (cd) {
    const target = new Date(cd.dataset.countdown).getTime();
    const cells = {
      d: cd.querySelector('[data-cd="d"]'),
      h: cd.querySelector('[data-cd="h"]'),
      m: cd.querySelector('[data-cd="m"]'),
      s: cd.querySelector('[data-cd="s"]'),
    };
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      cells.d.textContent = pad(d);
      cells.h.textContent = pad(h);
      cells.m.textContent = pad(m);
      cells.s.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- drag-to-scroll shelves ---------- */
  document.querySelectorAll("[data-drag-scroll]").forEach((shelf) => {
    let down = false, startX = 0, startScroll = 0, moved = false;
    shelf.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = shelf.scrollLeft;
      shelf.classList.add("dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      shelf.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", () => {
      down = false;
      shelf.classList.remove("dragging");
    });
    shelf.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });

  /* ---------- 3D tilt (mouse only) ---------- */
  window.attachTilt = function (el, strength) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const s = strength || 10;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * s}deg) rotateX(${-y * s}deg)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  };
  document.querySelectorAll("[data-tilt]").forEach((el) => window.attachTilt(el));

  /* ---------- toast ---------- */
  let toastEl = null, toastTimer = null;
  window.showToast = function (html) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toast]");
    if (btn) {
      e.preventDefault();
      window.showToast(btn.dataset.toast);
    }
  });

  /* ---------- newsletter ---------- */
  document.querySelectorAll("form.newsletter").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      if (input && input.value.includes("@")) {
        window.showToast("Welcome to the inner circle. <b>You're on the list.</b>");
        input.value = "";
      } else {
        window.showToast("Please enter a valid email address.");
      }
    });
  });
})();
