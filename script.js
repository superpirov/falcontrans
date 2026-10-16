(() => {
"use strict";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* preloader */
addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 450);
});
setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 2600);

/* nav + progress */
const nav = document.getElementById("nav");
const progress = document.getElementById("progress");
let ticking = false;
function onScrollFrame() {
  ticking = false;
  const y = scrollY;
  nav?.classList.toggle("scrolled", y > 24);
  const h = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
  driveHighway();
  driveBoard();
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
}, { passive: true });
onScrollFrame();

/* mobile menu */
const burger = document.getElementById("burger");
const mmenu = document.getElementById("mmenu");
burger?.addEventListener("click", () => {
  const open = mmenu.hidden;
  mmenu.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});
mmenu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mmenu.hidden = true; document.body.style.overflow = "";
  burger.setAttribute("aria-expanded", "false");
}));

/* reveal */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* counters */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, target = parseInt(el.dataset.count, 10);
  cio.unobserve(el);
  if (reduced || !target) { el.textContent = target.toLocaleString("ru-RU"); return; }
  const t0 = performance.now(), dur = 1600;
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    const ez = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ez * target).toLocaleString("ru-RU");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

/* board mini truck loop */
let boardP = 0;
function driveBoard() {
  if (reduced) return;
  boardP = (boardP + 0.0035) % 1;
  const t = document.getElementById("boardTruck");
  if (t) t.style.left = `${(boardP * 100).toFixed(2)}%`;
}
if (!reduced) setInterval(driveBoard, 50);

/* HIGHWAY — scroll-driven convoy */
const stage = document.getElementById("roadStage");
const vVan = document.getElementById("vVan");
const vTruck = document.getElementById("vTruck");
const vFork = document.getElementById("vFork");
function driveHighway() {
  if (!stage) return;
  const r = stage.getBoundingClientRect();
  const vh = innerHeight;
  // progress while stage crosses viewport
  const total = r.height + vh;
  const passed = vh - r.top;
  let p = passed / total;
  p = Math.max(0, Math.min(1, p));
  const eased = p; // linear: constant motion, honest to scroll
  const W = stage.clientWidth;
  const setX = (el, from, to, k) => {
    if (!el) return;
    const x = from + (to - from) * Math.min(Math.max(eased * k, 0), 1);
    el.style.transform = `translate3d(${x}px,0,0)`;
  };
  if (reduced) return;
  setX(vVan, -320, W - 240, 1.15);    // van: fastest, city sprinter
  setX(vTruck, -560, W - 420, 0.92);  // truck: heavy, steady
  setX(vFork, -320, W - 300, 0.62);   // forklift: slow yard machine
}
driveHighway();
addEventListener("resize", driveHighway);

/* fleet tabs */
const tabs = [...document.querySelectorAll(".tab")];
const counts = { fura: ["64", "фуры сегодня на линии"], ref: ["28", "рефрижератора в рейсах"], tral: ["12", "тралов готовы к подаче"], fork: ["36", "погрузчиков на сменах"] };
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
  t.classList.add("active"); t.setAttribute("aria-selected", "true");
  document.querySelectorAll(".panel").forEach(p => { p.classList.remove("active"); p.hidden = true; });
  const panel = document.getElementById("p-" + t.dataset.tab);
  if (panel) { panel.hidden = false; panel.classList.add("active"); }
  const c = counts[t.dataset.tab];
  if (c) {
    const n = document.getElementById("fleetCount"), s = document.getElementById("fleetNote");
    if (n) n.textContent = c[0];
    if (s) s.textContent = c[1];
  }
}));

/* calculator */
const KM = {
  "москва|казань": 820, "казань|москва": 820,
  "москва|екатеринбург": 1790, "екатеринбург|москва": 1790,
  "москва|санкт-петербург": 700, "санкт-петербург|москва": 700,
  "москва|краснодар": 1350, "краснодар|москва": 1350,
  "москва|новосибирск": 3400, "новосибирск|москва": 3400,
  "новосибирск|владивосток": 5600, "владивосток|новосибирск": 5600,
  "санкт-петербург|краснодар": 2300, "краснодар|санкт-петербург": 2300,
};
const norm = s => (s || "").trim().toLowerCase().replace(/ё/g, "е");
function estimateKm(a, b) {
  const k = norm(a) + "|" + norm(b);
  if (KM[k]) return KM[k];
  let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) % 2000;
  return 700 + h;
}
const calcForm = document.getElementById("calcForm");
calcForm?.addEventListener("submit", e => {
  e.preventDefault();
  const from = document.getElementById("cFrom").value || "Москва";
  const to = document.getElementById("cTo").value || "Казань";
  const w = Math.max(0.3, Math.min(60, parseFloat(document.getElementById("cWeight").value) || 5));
  const type = document.getElementById("cType");
  const mult = parseFloat(type.value);
  const label = type.options[type.selectedIndex].text;
  const priceEl = document.getElementById("calcPrice");
  const metaEl = document.getElementById("calcMeta");
  if (mult === 0.4) {
    priceEl.textContent = "15 200 ₽";
    metaEl.textContent = "Погрузчик · смена 8 часов · водитель включён";
    return;
  }
  const km = estimateKm(from, to);
  const perKm = mult === 1.18 ? 92 : mult === 1.8 ? 140 : 78;
  const wMult = Math.min(1 + (w - 1) * 0.045, 2.6);
  const price = Math.round((km * perKm * wMult + 4000) / 100) * 100;
  const days = Math.max(1, Math.ceil(km / 750));
  priceEl.textContent = price.toLocaleString("ru-RU") + " ₽";
  metaEl.textContent = `${from} → ${to} · ${km.toLocaleString("ru-RU")} км · ${days} ${days === 1 ? "день" : "дня"} · ${label.toLowerCase()} · ${w} т`;
});

/* lead form validation */
const lead = document.getElementById("leadForm");
lead?.addEventListener("submit", e => {
  e.preventDefault();
  const name = lead.name, phone = lead.phone;
  let ok = true;
  const setErr = (input, bad) => {
    input.classList.toggle("invalid", bad);
    const err = input.parentElement.querySelector(".err");
    if (err) err.hidden = !bad;
    if (bad) ok = false;
  };
  setErr(name, name.value.trim().length < 2);
  setErr(phone, (phone.value.replace(/\D/g, "")).length < 11);
  if (!ok) return;
  document.getElementById("formOk").hidden = false;
  lead.reset();
  setTimeout(() => { document.getElementById("formOk").hidden = true; }, 6000);
});
lead?.querySelectorAll("input").forEach(i => i.addEventListener("input", () => {
  i.classList.remove("invalid");
  const err = i.parentElement.querySelector(".err");
  if (err) err.hidden = true;
}));

/* magnetic buttons */
if (finePointer && !reduced) {
  document.querySelectorAll("[data-magnet]").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate3d(${(x * 8).toFixed(1)}px,${(y * 6).toFixed(1)}px,0)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}
})();
