'use strict';
const isTouchDevice='ontouchstart'in window||navigator.maxTouchPoints>0;

// PRELOADER
(function(){
  const num=document.getElementById('loader-num');
  const preloader=document.getElementById('preloader');
  if(!preloader){initAll();return}
  let count=0;
  document.body.style.overflow='hidden';
  const iv=setInterval(()=>{
    count+=Math.floor(Math.random()*8)+2;
    if(count>=100){count=100;clearInterval(iv)}
    if(num)num.textContent=count;
    if(count===100)setTimeout(()=>{preloader.classList.add('done');document.body.style.overflow='';initAll()},500);
  },40);
})();

// CURSOR
(function(){
  if(isTouchDevice)return;
  const dot=document.getElementById('cursorDot'),ring=document.getElementById('cursorRing');
  if(!dot||!ring)return;
  let mx=-100,my=-100,rx=-100,ry=-100;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px)`});
  (function loop(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
  document.querySelectorAll('a,button,[data-magnetic]').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
  });
})();

// CANVAS PARTICLES
(function(){
  const c=document.getElementById('ambientCanvas');if(!c)return;
  const ctx=c.getContext('2d');let w,h,particles=[];
  function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  class P{
    constructor(){this.reset()}
    reset(){this.x=Math.random()*w;this.y=Math.random()*h;this.s=Math.random()*1.5+.5;this.sx=(Math.random()-.5)*.3;this.sy=(Math.random()-.5)*.3;this.o=Math.random()*.4+.1;this.hue=Math.random()>.5?270:190}
    update(){this.x+=this.sx;this.y+=this.sy;if(this.x<0||this.x>w||this.y<0||this.y>h)this.reset()}
    draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2);ctx.fillStyle=`hsla(${this.hue},80%,70%,${this.o})`;ctx.fill()}
  }
  const n=Math.min(60,Math.floor(w*h/20000));
  for(let i=0;i<n;i++)particles.push(new P());
  (function anim(){ctx.clearRect(0,0,w,h);particles.forEach(p=>{p.update();p.draw()});requestAnimationFrame(anim)})();
})();

// NAVBAR SCROLL
(function(){
  const nav=document.getElementById('navbar');if(!nav)return;
  let t=false;
  window.addEventListener('scroll',()=>{if(!t){requestAnimationFrame(()=>{nav.classList.toggle('scrolled',window.scrollY>60);t=false});t=true}});
})();

// MOBILE MENU
(function(){
  const h=document.getElementById('hamburger'),m=document.getElementById('mobileMenu');
  if(!h||!m)return;
  h.addEventListener('click',()=>{h.classList.toggle('active');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':''});
  m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{h.classList.remove('active');m.classList.remove('open');document.body.style.overflow=''}));
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id==='#')return;e.preventDefault();const t=document.querySelector(id);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})});
});

// SCROLL INDICATOR FADE
(function(){const el=document.getElementById('scrollIndicator');if(!el)return;window.addEventListener('scroll',()=>{el.style.opacity=window.scrollY>200?'0':'1'})})();

function initAll(){
  // REVEAL
  const obs=new IntersectionObserver(entries=>{entries.forEach((entry,i)=>{if(entry.isIntersecting){const p=entry.target.parentElement;const siblings=p?Array.from(p.querySelectorAll('.reveal')):[];const idx=siblings.indexOf(entry.target);setTimeout(()=>entry.target.classList.add('active'),(idx>=0?idx:0)*80);obs.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  // COUNTERS
  const cObs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target,target=parseInt(el.dataset.count),dur=1500,start=performance.now();
    function tick(now){const p=Math.min((now-start)/dur,1);el.textContent=Math.floor((1-Math.pow(1-p,3))*target);if(p<1)requestAnimationFrame(tick)}
    requestAnimationFrame(tick);cObs.unobserve(el)}})},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(c=>cObs.observe(c));

  // SKILL BARS
  const sObs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){setTimeout(()=>{entry.target.style.width=entry.target.dataset.width+'%'},200);sObs.unobserve(entry.target)}})},{threshold:.3});
  document.querySelectorAll('.sk-fill').forEach(f=>sObs.observe(f));

  // MAGNETIC
  if(!isTouchDevice){document.querySelectorAll('[data-magnetic]').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.2}px)`});
    el.addEventListener('mouseleave',()=>{el.style.transform='';el.style.transition='transform .4s cubic-bezier(.23,1,.32,1)';setTimeout(()=>{el.style.transition=''},400)});
  })}
}
