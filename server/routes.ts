import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import { piEngine } from "./pi_engine.js";
import { api } from "../shared/routes.js";
import { setupAuth, registerAuthRoutes, verifySupabaseToken, supabase } from "./auth/supabaseAuth.js";
import path from "path";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Wallpapers are served via Supabase Storage

  // API Routes
  app.get(api.pi.state.path, async (req, res) => {
    const state = await storage.getGlobalState();
    res.json(state);
  });

  app.get(api.pi.myDigit.path, verifySupabaseToken, async (req, res) => {
    const userId = (req.user as any).id;
    const userState = await storage.getUserPiState(userId);

    if (!userState) {
      return res.json(null);
    }

    const digitIndex = userState.digitIndex - 1; // 0-based index for Pi sequence
    const digitValue = piEngine.getDigit(digitIndex);

    // User N reveals Digit N. They form a chord with Digit N-1 if N > 1.
    const hasChord = userState.digitIndex > 1;
    const fromDigit = hasChord ? piEngine.getDigit(digitIndex - 1) : null;

    res.json({
      digitIndex: userState.digitIndex,
      digitValue: digitValue,
      fromDigit,
      toDigit: digitValue,
      chordNumber: hasChord ? userState.digitIndex - 1 : null,
      assignedAt: userState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.post(api.pi.assignDigit.path, verifySupabaseToken, async (req, res) => {
    const userId = (req.user as any).id;

    // Check if already has one
    const existing = await storage.getUserPiState(userId);
    if (existing) {
      const dIndex = existing.digitIndex - 1;
      const dValue = piEngine.getDigit(dIndex);
      const hasC = existing.digitIndex > 1;
      const fDigit = hasC ? piEngine.getDigit(dIndex - 1) : null;

      return res.json({
        digitIndex: existing.digitIndex,
        digitValue: dValue,
        fromDigit: fDigit,
        toDigit: dValue,
        chordNumber: hasC ? existing.digitIndex - 1 : null,
        assignedAt: existing.assignedAt?.toISOString() || new Date().toISOString(),
      });
    }

    // Assign EXACTLY ONE new digit
    const globalState = await storage.incrementTotalUsers();
    const userDigitNumber = globalState.currentDigitIndex; // This will be 2 for the first user

    const digitIndex = userDigitNumber - 1; // 0-based index of Pi
    const digitValue = piEngine.getDigit(digitIndex);

    const newState = await storage.createUserPiState({
      userId,
      digitIndex: userDigitNumber,
      digitValue: digitValue,
    });

    // CRITICAL: Await render so user sees updated art immediately
    await piEngine.renderAllResolutions().catch(console.error);

    const hasC = userDigitNumber > 1;
    const fDigit = hasC ? piEngine.getDigit(digitIndex - 1) : null;

    res.json({
      digitIndex: newState.digitIndex,
      digitValue: newState.digitValue,
      fromDigit: fDigit,
      toDigit: digitValue,
      chordNumber: hasC ? userDigitNumber - 1 : null,
      assignedAt: newState.assignedAt?.toISOString() || new Date().toISOString(),
    });
  });

  app.get(api.pi.timeline.path, async (req, res) => {
    // 1. Get System Node (Index 1, Value 3)
    const systemNode = {
      digitIndex: 1,
      digitValue: 3,
      isSystem: true,
      user: null
    };

    // 2. Get User Nodes
    const userStates = await storage.getAllUserPiStates();

    // Map to response format
    const userNodes = userStates.map(({ state, user }) => ({
      digitIndex: state.digitIndex,
      digitValue: state.digitValue,
      isSystem: false,
      user: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        instagramHandle: user.instagramHandle,
      } : null,
    }));

    // Combine and Sort
    const timeline = [systemNode, ...userNodes].sort((a, b) => a.digitIndex - b.digitIndex);

    res.json(timeline);
  });

  app.get(api.pi.wallpaper.path, async (req, res) => {
    // Return Public URLs from Supabase Storage
    const { data } = supabase.storage.from('wallpapers').getPublicUrl('latest.png');
    const baseUrl = data.publicUrl.replace('/latest.png', '');

    const ts = Date.now();
    res.json({
      latest: `${baseUrl}/latest.png?t=${ts}`,
      resolutions: {
        "iphone-11": `${baseUrl}/iphone-11.png?t=${ts}`,
        "iphone-11-pro": `${baseUrl}/iphone-11-pro.png?t=${ts}`,
        "iphone-12": `${baseUrl}/iphone-12.png?t=${ts}`,
        "iphone-14-pro": `${baseUrl}/iphone-14-pro.png?t=${ts}`,
        "iphone-14-plus": `${baseUrl}/iphone-14-plus.png?t=${ts}`,
        "iphone-14-pro-max": `${baseUrl}/iphone-14-pro-max.png?t=${ts}`,
        "iphone-15": `${baseUrl}/iphone-15.png?t=${ts}`,
        "iphone-15-pro-max": `${baseUrl}/iphone-15-pro-max.png?t=${ts}`,
        "iphone-16-pro": `${baseUrl}/iphone-16-pro.png?t=${ts}`,
        "iphone-16-pro-max": `${baseUrl}/iphone-16-pro-max.png?t=${ts}`,
      }
    });
  });

  // ─── Live Wallpaper Viewer — HD animated canvas page ────────────────────────
  app.get("/wallpapers/latest.png", async (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Flow of Pi — Live Wallpaper</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{
  height:100%;background:#000;color:#e5e5e5;
  font-family:'Inter',system-ui,sans-serif;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:24px;overflow:hidden;user-select:none;
}
header{text-align:center;display:flex;flex-direction:column;gap:6px}
h1{
  font-size:1.35rem;font-weight:700;letter-spacing:.05em;
  background:linear-gradient(135deg,#A855F7 0%,#6366F1 40%,#3B82F6 70%,#2DD4BF 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.subtitle{
  font-size:.7rem;color:#555;letter-spacing:.1em;text-transform:uppercase;
  display:flex;align-items:center;gap:6px;justify-content:center;
}
.live-dot{
  width:6px;height:6px;border-radius:50%;background:#4ADE80;
  box-shadow:0 0 6px #4ADE80;
  animation:ping 2s ease-in-out infinite;
}
@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
#wrap{
  position:relative;border-radius:18px;overflow:hidden;
  border:1px solid rgba(255,255,255,.07);
  box-shadow:0 0 80px rgba(99,102,241,.18),0 0 160px rgba(168,85,247,.1),inset 0 0 0 1px rgba(255,255,255,.04);
}
canvas{display:block}
#status{
  font-size:.68rem;color:#555;letter-spacing:.06em;min-height:14px;
  transition:color .4s;
}
#status.active{color:#6366F1}
.actions{display:flex;gap:10px;align-items:center}
button{
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 20px;border-radius:10px;
  font-size:.82rem;font-weight:600;font-family:inherit;
  cursor:pointer;border:none;transition:all .2s;letter-spacing:.02em;
}
button:active{transform:scale(.96)}
#btn-download{
  background:linear-gradient(135deg,#6366F1,#3B82F6);
  color:#fff;box-shadow:0 4px 20px rgba(99,102,241,.35);
}
#btn-download:hover{box-shadow:0 4px 28px rgba(99,102,241,.55);transform:translateY(-1px)}
#btn-replay{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#ccc;
}
#btn-replay:hover{background:rgba(255,255,255,.09);color:#fff}
#chord-count{
  font-size:.68rem;color:rgba(255,255,255,.25);letter-spacing:.04em;
  padding:4px 12px;border:1px solid rgba(255,255,255,.07);border-radius:100px;
}
</style>
</head>
<body>
<header>
  <h1>Flow of Pi</h1>
  <div class="subtitle"><span class="live-dot"></span>Live Wallpaper&nbsp;&middot;&nbsp;Updates every 10s</div>
</header>

<div id="wrap"><canvas id="c"></canvas></div>

<div id="status">Initialising\u2026</div>

<div class="actions">
  <span id="chord-count">\u2014</span>
  <button id="btn-replay">\u21baReplay</button>
  <button id="btn-download">\u2b07Download</button>
</div>

<script>
const COLORS=["#666666","#EF4444","#F97316","#FACC15","#4ADE80","#2DD4BF","#3B82F6","#6366F1","#A855F7","#EC4899"];
const PHI=(1+Math.sqrt(5))/2;
const PI_STR="31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
function pd(i){
  if(i<PI_STR.length)return parseInt(PI_STR[i],10);
  return Math.floor(((i*1.61803398875)%1)*10);
}

// HiDPI canvas
const DPR=Math.min(window.devicePixelRatio||1,3);
const wrap=document.getElementById('wrap');
const cnv=document.getElementById('c');
const ctx=cnv.getContext('2d');
const CSS_H=Math.min(window.innerHeight*0.72,640);
const CSS_W=Math.round(CSS_H*(1170/2532));
cnv.style.width=CSS_W+'px'; cnv.style.height=CSS_H+'px';
wrap.style.width=CSS_W+'px'; wrap.style.height=CSS_H+'px';
cnv.width=CSS_W*DPR; cnv.height=CSS_H*DPR;
ctx.scale(DPR,DPR);
const W=CSS_W,H=CSS_H,CX=W/2,CY=H/2,R=Math.min(W,H)*0.42;

function clearBg(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);}
function drawRing(){
  const seg=(Math.PI*2)/10;
  ctx.lineWidth=R*0.025; ctx.lineCap='butt';
  for(let d=0;d<10;d++){
    const s=d*seg-Math.PI/2,e=(d+1)*seg-Math.PI/2;
    ctx.beginPath(); ctx.arc(CX,CY,R,s+0.012,e-0.012);
    ctx.strokeStyle=COLORS[d];
    ctx.shadowColor=COLORS[d]; ctx.shadowBlur=8/DPR;
    ctx.stroke(); ctx.shadowBlur=0;
  }
}
function drawChord(i,alpha){
  const a=alpha??0.78,seg=(Math.PI*2)/10;
  const dA=pd(i-1),dB=pd(i);
  const jA=((i*PHI)%1)*0.9+0.05,jB=(((i+1)*PHI)%1)*0.9+0.05;
  const aA=dA*seg+jA*seg-Math.PI/2,aB=dB*seg+jB*seg-Math.PI/2;
  const x1=CX+R*Math.cos(aA),y1=CY+R*Math.sin(aA);
  const x2=CX+R*Math.cos(aB),y2=CY+R*Math.sin(aB);
  let mid=(aA+aB)/2; if(Math.abs(aA-aB)>Math.PI)mid+=Math.PI;
  const cpX=CX+R*0.4*Math.cos(mid),cpY=CY+R*0.4*Math.sin(mid);
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,COLORS[dA]); g.addColorStop(1,COLORS[dB]);
  ctx.globalAlpha=a; ctx.lineWidth=1.8;
  ctx.shadowColor=COLORS[dA]; ctx.shadowBlur=4/DPR;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cpX,cpY,x2,y2);
  ctx.strokeStyle=g; ctx.stroke();
  ctx.shadowBlur=0; ctx.globalAlpha=1;
}
function drawDot(pos,bright){
  const seg=(Math.PI*2)/10,d=pd(pos);
  const j=((pos*PHI)%1)*0.9+0.05,a=d*seg+j*seg-Math.PI/2;
  const rr=R+(bright?16:12),radius=bright?4:2.8;
  const px=CX+rr*Math.cos(a),py=CY+rr*Math.sin(a);
  ctx.fillStyle=COLORS[d]; ctx.globalAlpha=bright?1:0.65;
  ctx.shadowColor=COLORS[d]; ctx.shadowBlur=(bright?14:6)/DPR;
  ctx.beginPath(); ctx.arc(px,py,radius,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0; ctx.globalAlpha=1;
}

const STATUS=document.getElementById('status');
const CHORD_COUNT=document.getElementById('chord-count');
let targetN=1,rafId=null,isAnimating=false;
function setStatus(msg,active){STATUS.textContent=msg;STATUS.className=active?'active':'';}
function easeOut(t){return 1-(1-t)**3;}
function drawAllFull(upTo){
  clearBg(); drawRing();
  for(let i=1;i<upTo;i++)drawChord(i,0.78);
  for(let i=0;i<upTo-1;i++)drawDot(i,false);
  if(upTo>1)drawDot(upTo-1,false);
}
function animateReveal(N){
  if(rafId){cancelAnimationFrame(rafId);rafId=null;}
  isAnimating=true; setStatus('Drawing\u2026',true);
  const msPerChord=N>300?8:N>100?16:N>30?30:55;
  let current=1,startTs=null;
  function frame(ts){
    if(!startTs)startTs=ts;
    const elapsed=ts-startTs,progress=Math.min(elapsed/msPerChord,1);
    const alpha=easeOut(progress)*0.78;
    clearBg(); drawRing();
    for(let i=1;i<current;i++)drawChord(i,0.78);
    if(current<N)drawChord(current,alpha);
    for(let i=0;i<current-1;i++)drawDot(i,false);
    if(current<N)drawDot(current-1,true);
    if(progress>=1){
      current++; startTs=null;
      if(current>=N){
        drawAllFull(N);
        if(N>1)drawDot(N-1,false);
        isAnimating=false;
        setStatus(N+' chord'+(N===1?'':'s')+' \u00b7 live',false);
        CHORD_COUNT.textContent=(N-1)+' chord'+((N-1)===1?'':'s');
        return;
      }
      setStatus('Drawing chord '+(current-1)+' / '+(N-1)+'\u2026',true);
    }
    rafId=requestAnimationFrame(frame);
  }
  CHORD_COUNT.textContent='0 / '+(N-1)+' chords';
  rafId=requestAnimationFrame(frame);
}

async function fetchState(){
  try{
    const r=await fetch('/api/pi/state'),d=await r.json(),n=d.currentDigitIndex||1;
    if(n!==targetN){targetN=n;animateReveal(targetN);}
  }catch{setStatus('Connection error \u2014 retrying\u2026');}
}
fetchState().then(()=>{if(!isAnimating)animateReveal(targetN);});
setInterval(fetchState,10000);

document.getElementById('btn-replay').addEventListener('click',()=>animateReveal(targetN));
document.getElementById('btn-download').addEventListener('click',async()=>{
  try{
    setStatus('Preparing download\u2026',true);
    const r=await fetch('/api/pi/wallpaper'),d=await r.json();
    const a=document.createElement('a');
    a.href=d.latest;a.download='flow-of-pi.png';a.target='_blank';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setStatus('Download started!',true);
    setTimeout(()=>setStatus(targetN+' chord'+(targetN===1?'':'s')+' \u00b7 live'),2500);
  }catch{setStatus('Download failed \u2014 try again');}
});
<\/script>
</body>
</html>`;

    res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(html);
  });

  // For Vercel, we can trigger this via a manual API endpoint or Vercel Cron
  app.get("/api/admin/render", verifySupabaseToken, async (req, res) => {
    // Simple protection - only allow specific user or check for a secret header
    await piEngine.renderAllResolutions();
    res.json({ status: "success" });
  });

  // Initial render on Koyeb startup
  console.log("Initial wallpaper render check...");
  // Delay slightly to let DB connect and bucket be created
  setTimeout(() => {
    piEngine.renderAllResolutions()
      .then(() => console.log("Startup render complete."))
      .catch(err => console.error("Startup render failed:", err));
  }, 10000);

  return httpServer;
}
