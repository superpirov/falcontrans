// Falcon Trans — dynamic engine
(function(){
  'use strict';

  // ---------- PRELOADER ----------
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const pct = document.getElementById('preloaderPct');
  let p = 0;
  const pint = setInterval(()=>{
    p = Math.min(100, p + Math.random()*18);
    if(fill) fill.style.width = p+'%';
    if(pct) pct.textContent = Math.floor(p)+'%';
    if(p>=100){
      clearInterval(pint);
      setTimeout(()=> preloader && preloader.classList.add('done'), 350);
    }
  },140);
  window.addEventListener('load', ()=>{
    setTimeout(()=> preloader && preloader.classList.add('done'), 1200);
  });
  setTimeout(()=> preloader && preloader.classList.add('done'), 3500);

  // ---------- NAV / PROGRESS / CURSOR ----------
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger && burger.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY; if(cursorDot){cursorDot.style.left=mx+'px';cursorDot.style.top=my+'px';}});
  (function loopCursor(){ cx+=(mx-cx)*0.16; cy+=(my-cy)*0.16; if(cursor){cursor.style.left=cx+'px';cursor.style.top=cy+'px';} requestAnimationFrame(loopCursor); })();

  // stars
  const starsBox = document.getElementById('stars');
  if(starsBox){ for(let i=0;i<70;i++){ const s=document.createElement('span'); s.style.left=Math.random()*100+'%'; s.style.top=Math.random()*60+'%'; s.style.animationDelay=(Math.random()*3)+'s'; starsBox.appendChild(s);} }

  // ---------- REVEAL ----------
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  },{threshold:0.12});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

  // ---------- COUNTERS ----------
  const cio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target; cio.unobserve(el);
      const target=+el.dataset.count||0; const t0=performance.now(); const dur=1600;
      (function tick(t){ const k=Math.min(1,(t-t0)/dur); const eased=1-Math.pow(1-k,3); el.textContent=Math.floor(target*eased).toLocaleString('ru-RU'); if(k<1) requestAnimationFrame(tick); })(t0);
    });
  },{threshold:0.6});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

  // ---------- SCROLL-DRIVEN VEHICLES ----------
  // hero highway vehicles move with scroll
  const hVehicles = document.querySelectorAll('.h-vehicle');
  const driveEls = [
    {el:document.getElementById('driveTruck1'), speed:0.55},
    {el:document.getElementById('driveTruck2'), speed:0.75},
    {el:document.getElementById('driveTruck3'), speed:1.15},
    {el:document.getElementById('driveFork'), speed:0.35},
  ];
  const driveFill = document.getElementById('driveFill');
  const driveStory = document.getElementById('driveStory');
  const forkAnim = document.getElementById('forkliftAnim');
  const forkBar = document.getElementById('forkBar');
  const forkHeight = document.getElementById('forkHeight');
  const flPallet = document.getElementById('flPallet');
  const fleetDrive = document.querySelectorAll('[data-drive]');

  function onScroll(){
    const y = scrollY;
    const vh = innerHeight;
    const doc = document.documentElement.scrollHeight - vh;
    const prog = doc>0 ? y/doc : 0;
    if(progress) progress.style.width = (prog*100)+'%';
    if(nav) nav.classList.toggle('scrolled', y>40);

    // hero vehicles: parallax horizontal
    hVehicles.forEach(v=>{
      const s = parseFloat(v.dataset.speed||'0.5');
      const x = ((y * s) % (innerWidth+400)) - 200;
      // alternate direction for fun
      v.style.transform = `translateX(${x}px)`;
    });

    // drive story progress (section-based)
    if(driveStory){
      const r = driveStory.getBoundingClientRect();
      // total scrollable inside sticky: use section height
      const total = r.height - vh;
      const done = Math.min(1, Math.max(0, -r.top / (total||1)));
      if(driveFill) driveFill.style.width = (done*100)+'%';
      driveEls.forEach(d=>{
        if(!d.el) return;
        const maxX = Math.max(300, (driveStory.clientWidth||innerWidth) - 220);
        const x = -100 + done * maxX * d.speed + Math.sin(y/200 + d.speed*5)*6;
        d.el.style.transform = `translateX(${x}px)`;
      });
    }

    // forklift lift tied to its visibility
    if(forkAnim){
      const r = forkAnim.getBoundingClientRect();
      const vis = Math.min(1, Math.max(0, 1 - Math.abs(r.top + r.height/2 - vh/2)/(vh*0.7)));
      const h = (vis*3.2);
      if(forkBar) forkBar.style.width = (vis*100)+'%';
      if(forkHeight) forkHeight.textContent = h.toFixed(1)+' м';
      if(flPallet) flPallet.style.transform = `translateY(${-vis*120}px)`;
      forkAnim.style.transform = `translateX(${Math.sin(y/300)*10}px)`;
    }

    // fleet cards subtle drive
    fleetDrive.forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top<vh && r.bottom>0){
        const k = (r.top + r.height/2 - vh/2)/vh; // -0.5..0.5
        const dir = el.dataset.drive==='left' ? 1 : -1;
        el.style.transform = `translateX(${k*40*dir}px)`;
      }
    });

    // footer truck
    const ft = document.getElementById('footerTruck');
    if(ft){ ft.style.transform = `translateX(${((y*0.4)%(innerWidth+300))-150}px)`; }
  }
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---------- HERO ROUTE ANIMATION ----------
  const heroDot = document.getElementById('heroTruckDot');
  const heroActive = document.getElementById('heroRouteActive');
  if(heroDot && heroActive){
    try{
      const len = heroActive.getTotalLength();
      heroActive.style.strokeDasharray = len;
      heroActive.style.strokeDashoffset = len;
      let t=0;
      setInterval(()=>{
        t=(t+0.008)%1;
        const pt = heroActive.getPointAtLength(t*len);
        heroDot.setAttribute('transform',`translate(${pt.x},${pt.y})`);
        heroActive.style.strokeDashoffset = len*(1-t);
      },30);
    }catch(e){}
  }

  // ---------- GEO TRUCK ----------
  const geoTruck = document.getElementById('geoTruck');
  const routeLine = document.getElementById('routeLine');
  if(geoTruck && routeLine){
    try{
      const len = routeLine.getTotalLength();
      let gt=0;
      setInterval(()=>{
        gt=(gt+0.006)%1;
        const pt=routeLine.getPointAtLength(gt*len);
        geoTruck.setAttribute('transform',`translate(${pt.x-12},${pt.y-24})`);
      },30);
    }catch(e){}
  }

  // ---------- CALCULATOR ----------
  const DIST = {
    'москва|санкт-петербург':700,'санкт-петербург|москва':700,
    'москва|казань':820,'казань|москва':820,
    'москва|екатеринбург':1780,'екатеринбург|москва':1780,
    'москва|новосибирск':3400,'новосибирск|москва':3400,
    'москва|краснодар':1350,'краснодар|москва':1350,
    'москва|ростов-на-дону':1070,'ростов-на-дону|москва':1070,
    'москва|самара':1050,'самара|москва':1050,
    'москва|владивосток':9000,'владивосток|москва':9000,
    'москва|калининград':1250,'калининград|москва':1250,
    'екатеринбург|новосибирск':1600,'казань|екатеринбург':960
  };
  function norm(s){return (s||'').trim().toLowerCase();}
  function getKm(a,b){
    a=norm(a); b=norm(b);
    if(!a||!b) return 800;
    if(a===b) return 45;
    const k=a+'|'+b;
    if(DIST[k]) return DIST[k];
    // fallback pseudo-distance by hash
    let h=0; const s=k; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%5000;
    return 600 + (h%2800);
  }
  const calcBtn=document.getElementById('calcBtn');
  function calc(){
    const from=document.getElementById('calcFrom').value||'Москва';
    const to=document.getElementById('calcTo').value||'Казань';
    const typeK=parseFloat(document.getElementById('calcType').value||'1.8');
    const extra=parseFloat(document.getElementById('calcExtra').value||'0');
    const express=document.getElementById('calcExpress').checked;
    const km=getKm(from,to);
    let base = km * (32*typeK); // базовая ставка
    // весовая надбавка
    const w=parseFloat(document.getElementById('calcWeight').value||'5');
    if(w>20) base*=1.25; else if(w>10) base*=1.1;
    if(express) base*=1.3;
    base+=extra;
    // округление до 100
    base=Math.round(base/100)*100;
    const hours=Math.max(2,Math.round(km/68));
    document.getElementById('resRoute').textContent=`${from} → ${to}`;
    document.getElementById('resKm').textContent=`${km.toLocaleString('ru-RU')} км`;
    document.getElementById('resTime').textContent=`~ ${hours} ч в пути`;
    document.getElementById('resPrice').textContent=`${base.toLocaleString('ru-RU')} ₽`;
    document.getElementById('resPerKm').textContent=`~ ${Math.round(base/km)} ₽/км`;
    const rt=document.getElementById('resTruck');
    if(rt){ rt.style.left='0'; setTimeout(()=>rt.style.left='calc(100% - 40px)',50); }
    document.getElementById('resOrder').textContent=`Заказать ${from} → ${to} за ${base.toLocaleString('ru-RU')} ₽`;
  }
  calcBtn && calcBtn.addEventListener('click',calc);
  document.getElementById('swapCities')?.addEventListener('click',()=>{
    const f=document.getElementById('calcFrom'), t=document.getElementById('calcTo');
    const v=f.value; f.value=t.value; t.value=v; calc();
  });
  ['calcFrom','calcTo','calcType','calcWeight','calcExtra','calcExpress'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',calc);
    document.getElementById(id)?.addEventListener('change',calc);
  });
  calc();
  document.getElementById('resWhatsapp')?.addEventListener('click',()=>{
    const r=document.getElementById('resRoute').textContent; const pr=document.getElementById('resPrice').textContent;
    toast(`Открываем WhatsApp: ${r} — ${pr}`);
  });

  // ---------- FLEET FILTER ----------
  document.querySelectorAll('.fleet-filter button').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.fleet-filter button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const f=b.dataset.filter;
      document.querySelectorAll('.fleet-card').forEach(c=>{
        c.classList.toggle('hide', f!=='all' && c.dataset.cat!==f);
      });
    });
  });

  // ---------- REVIEWS SLIDER ----------
  const track=document.getElementById('reviewsTrack');
  let rIdx=0;
  function showRev(){
    if(!track) return;
    const cardW = track.children[0].getBoundingClientRect().width + 16;
    const perView = innerWidth<1020?1:2;
    const max = track.children.length - perView;
    rIdx=Math.max(0,Math.min(max,rIdx));
    track.style.transform=`translateX(${-rIdx*cardW}px)`;
    const d=document.getElementById('revDots'); if(d) d.textContent=`${rIdx+1} / ${max+1}`;
  }
  document.getElementById('revPrev')?.addEventListener('click',()=>{rIdx--;showRev();});
  document.getElementById('revNext')?.addEventListener('click',()=>{rIdx++;showRev();});
  addEventListener('resize',showRev); showRev();
  setInterval(()=>{ if(!document.hidden){ rIdx++; const max=track?track.children.length-2:0; if(rIdx>max) rIdx=0; showRev(); } },6000);

  // ---------- TRACK MODAL ----------
  const modal=document.getElementById('trackModal');
  const openM=()=>modal&&modal.classList.add('open');
  const closeM=()=>modal&&modal.classList.remove('open');
  document.getElementById('trackOpen')?.addEventListener('click',openM);
  document.getElementById('heroTrackBtn')?.addEventListener('click',openM);
  document.getElementById('trackClose')?.addEventListener('click',closeM);
  modal?.addEventListener('click',e=>{ if(e.target===modal) closeM(); });
  document.getElementById('trackBtn')?.addEventListener('click',()=>{
    const v=document.getElementById('trackInput').value||'FT-8842';
    const pctM=55+Math.floor(Math.random()*35);
    document.getElementById('trackFill').style.width=pctM+'%';
    document.getElementById('trackText').innerHTML=`Машина <b>${v.toUpperCase()}</b> • водитель на связи • прибытие сегодня • <b class="green">идёт по графику ${pctM}%</b>`;
  });

  // ---------- FORM ----------
  function toast(msg){
    const t=document.getElementById('toast');
    if(!t) return; t.textContent='✅ '+msg;
    t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3500);
  }
  window.toast=toast;
  document.getElementById('orderForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('fName').value||'друг';
    toast(`Заявка отправлена, ${name}! Менеджер перезвонит за 5 минут.`);
    e.target.reset();
  });

  // ---------- TILT + MAGNETIC ----------
  if(matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
        card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave',()=>card.style.transform='');
    });
    document.querySelectorAll('.magnetic').forEach(b=>{
      b.addEventListener('mousemove',e=>{
        const r=b.getBoundingClientRect();
        b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.15}px,${(e.clientY-r.top-r.height/2)*0.15}px)`;
      });
      b.addEventListener('mouseleave',()=>b.style.transform='');
    });
  }

  // ---------- GSAP SCROLLTRIGGER (if loaded) ----------
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.service-card, .fleet-card, .case-card').forEach((el,i)=>{
      gsap.fromTo(el,{y:60,opacity:0},{y:0,opacity:1,duration:0.7,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 88%'}});
    });
  }
})();
