/**
 * BowlerStats.in — Main Application Logic
 * IPL Bowler Run Histogram
 */

'use strict';

// ── State ────────────────────────────────────────────
let matchData  = null;
let activeTeam = 'rcb'; // 'rcb' | 'mi'
let tooltip    = null;

// ── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  tooltip = document.getElementById('tooltip');
  loadData();
  initNavToggle();
  initScrollTop();
  initTabs();
  initContactForm();
});

// ── Fetch data.json ───────────────────────────────────
async function loadData() {
  try {
    const res  = await fetch('data.json?v=' + Date.now());
    matchData  = await res.json();
    renderAll();
    hideLoader();
  } catch (e) {
    console.error('Failed to load data.json:', e);
    document.getElementById('loader').querySelector('.loader-cricket').textContent =
      '⚠ Could not load match data';
  }
}

// ── Render Everything ─────────────────────────────────
function renderAll() {
  updateMatchMeta();
  renderHistogram(activeTeam);
  renderBowlerTable(activeTeam);
  renderStatsCards(activeTeam);
  renderSidebar(activeTeam);
}

// ── Match Meta Header ─────────────────────────────────
function updateMatchMeta() {
  const m = matchData.meta;
  setText('match-title',  m.match);
  setText('match-venue',  `📍 ${m.venue}`);
  setText('match-date',   `🗓 ${formatDate(m.date)}`);
  setText('match-season', m.season);
}

// ── Histogram ─────────────────────────────────────────
function renderHistogram(team) {
  const container = document.getElementById('histogram-container');
  const overs     = matchData[team].overs;
  const maxRuns   = Math.max(...overs.map(o => o.runs));

  container.innerHTML = '';

  overs.forEach(over => {
    const heightPct = (over.runs / (maxRuns + 2)) * 100;

    const group = document.createElement('div');
    group.className = 'bar-group';
    group.setAttribute('data-over', over.over);
    group.setAttribute('data-bowler', over.bowler);
    group.setAttribute('data-runs', over.runs);
    group.setAttribute('data-wicket', over.wicket);

    const bar = document.createElement('div');
    bar.className = 'bar' + (over.wicket ? ' wicket' : '');
    bar.style.height = '0%';  // start at 0 for animation

    if (over.wicket) {
      const wi = document.createElement('span');
      wi.className = 'wicket-icon';
      wi.title = 'Wicket!';
      wi.textContent = '🎯';
      bar.appendChild(wi);
    }

    const runsLabel = document.createElement('span');
    runsLabel.className = 'bar-runs';
    runsLabel.textContent = over.runs;

    const overLabel = document.createElement('div');
    overLabel.className = 'bar-label';
    overLabel.textContent = over.over;

    group.appendChild(runsLabel);
    group.appendChild(bar);
    group.appendChild(overLabel);
    container.appendChild(group);

    // Tooltip events
    group.addEventListener('mousemove', (e) => showTooltip(e, over));
    group.addEventListener('mouseleave', hideTooltip);

    // Animate bar height after paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.style.height = heightPct + '%';
      }, 50 + over.over * 25);
    });
  });
}

// ── Tooltip ───────────────────────────────────────────
function showTooltip(e, over) {
  tooltip.innerHTML = `
    <strong>Over ${over.over}</strong>
    🏏 ${over.bowler}<br>
    💥 ${over.runs} runs conceded<br>
    ${over.wicket ? '🎯 Wicket taken!' : ''}
  `;
  tooltip.classList.add('show');
  positionTooltip(e);
}

function hideTooltip() {
  tooltip.classList.remove('show');
}

function positionTooltip(e) {
  const tw = tooltip.offsetWidth  || 180;
  const th = tooltip.offsetHeight || 80;
  let   x  = e.clientX + 14;
  let   y  = e.clientY - th - 10;
  if (x + tw > window.innerWidth)  x = e.clientX - tw - 14;
  if (y < 0) y = e.clientY + 14;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

document.addEventListener('mousemove', (e) => {
  if (tooltip.classList.contains('show')) positionTooltip(e);
});

// ── Stats Cards ───────────────────────────────────────
function renderStatsCards(team) {
  const overs   = matchData[team].overs;
  const total   = overs.reduce((s, o) => s + o.runs, 0);
  const wickets = overs.filter(o => o.wicket).length;
  const maxOver = overs.reduce((a, b) => b.runs > a.runs ? b : a);
  const minOver = overs.reduce((a, b) => b.runs < a.runs ? b : a);
  const economy = (total / overs.length).toFixed(1);

  setText('stat-total',    total);
  setText('stat-wickets',  wickets);
  setText('stat-economy',  economy);
  setText('stat-max',      `${maxOver.runs} (O${maxOver.over})`);
}

// ── Bowler Summary Table ──────────────────────────────
function renderBowlerTable(team) {
  const overs = matchData[team].overs;
  const tbody = document.getElementById('bowler-tbody');

  // Aggregate per bowler
  const bowlerMap = {};
  overs.forEach(o => {
    if (!bowlerMap[o.bowler]) {
      bowlerMap[o.bowler] = { overs: 0, runs: 0, wickets: 0 };
    }
    bowlerMap[o.bowler].overs++;
    bowlerMap[o.bowler].runs    += o.runs;
    bowlerMap[o.bowler].wickets += o.wicket ? 1 : 0;
  });

  const rows = Object.entries(bowlerMap)
    .sort((a, b) => b[1].runs - a[1].runs);

  tbody.innerHTML = rows.map(([name, stats], i) => {
    const econ = (stats.runs / stats.overs).toFixed(2);
    const econClass = econ < 7 ? 'good' : econ < 9 ? 'avg' : 'bad';
    return `
      <tr>
        <td>${i + 1}</td>
        <td class="name-cell">${name}</td>
        <td>${stats.overs}</td>
        <td>${stats.runs}</td>
        <td>${stats.wickets}</td>
        <td class="economy ${econClass}">${econ}</td>
      </tr>
    `;
  }).join('');
}

// ── Sidebar ───────────────────────────────────────────
function renderSidebar(team) {
  const overs = matchData[team].overs;

  // Aggregate per bowler
  const bowlerMap = {};
  overs.forEach(o => {
    if (!bowlerMap[o.bowler]) bowlerMap[o.bowler] = { runs: 0, wickets: 0, overs: 0 };
    bowlerMap[o.bowler].runs    += o.runs;
    bowlerMap[o.bowler].wickets += o.wicket ? 1 : 0;
    bowlerMap[o.bowler].overs++;
  });

  const sorted = Object.entries(bowlerMap).sort((a, b) => b[1].runs - a[1].runs);

  // Most expensive
  const expList = document.getElementById('expensive-list');
  expList.innerHTML = sorted.slice(0, 5).map(([name, s], i) => `
    <div class="rank-item">
      <div class="rank-num ${['gold','silver','bronze','',''][i] || ''}">${i+1}</div>
      <div class="rank-info">
        <div class="rank-name">${name}</div>
        <div class="rank-detail">${s.overs} ov · ${s.wickets}W</div>
      </div>
      <div class="rank-runs">${s.runs}</div>
    </div>
  `).join('');

  // Best (least runs)
  const econSorted = [...sorted].sort((a, b) => {
    return (a[1].runs / a[1].overs) - (b[1].runs / b[1].overs);
  });
  const bestList = document.getElementById('best-list');
  bestList.innerHTML = econSorted.slice(0, 3).map(([name, s], i) => `
    <div class="rank-item">
      <div class="rank-num ${['gold','silver','bronze'][i]}">${i+1}</div>
      <div class="rank-info">
        <div class="rank-name">${name}</div>
        <div class="rank-detail">${(s.runs/s.overs).toFixed(1)} econ</div>
      </div>
      <div class="rank-runs" style="color:var(--accent-green)">${s.runs}</div>
    </div>
  `).join('');

  drawSparkline(overs);
}

// ── Sparkline ─────────────────────────────────────────
function drawSparkline(overs) {
  const canvas = document.getElementById('sparkline');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 260;
  const H = canvas.offsetHeight || 60;
  canvas.width  = W;
  canvas.height = H;

  const runs   = overs.map(o => o.runs);
  const maxR   = Math.max(...runs);
  const step   = W / (runs.length - 1);

  ctx.clearRect(0, 0, W, H);

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(240,180,41,0.35)');
  grad.addColorStop(1, 'rgba(240,180,41,0)');

  ctx.beginPath();
  runs.forEach((r, i) => {
    const x = i * step;
    const y = H - (r / maxR) * (H - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  // Close path for fill
  ctx.lineTo((runs.length - 1) * step, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  runs.forEach((r, i) => {
    const x = i * step;
    const y = H - (r / maxR) * (H - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#f0b429';
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.stroke();
}

// ── Tabs ──────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTeam = btn.dataset.team;
      renderHistogram(activeTeam);
      renderBowlerTable(activeTeam);
      renderStatsCards(activeTeam);
      renderSidebar(activeTeam);
      // Update section badge
      const badge = document.getElementById('section-badge');
      if (badge) {
        badge.textContent = activeTeam === 'rcb' ? 'RCB BOWLING' : 'MI BOWLING';
        badge.className   = 'badge ' + (activeTeam === 'rcb' ? 'badge-rcb' : 'badge-mi');
      }
    });
  });
}

// ── Nav Toggle (mobile) ───────────────────────────────
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
    }
  });
}

// ── Scroll Top ────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Contact Form ──────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✅ Sent!';
    btn.disabled    = true;
    setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; form.reset(); }, 3000);
  });
}

// ── Helpers ───────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function hideLoader() {
  const el = document.getElementById('loader');
  if (el) { el.classList.add('hidden'); setTimeout(() => el.remove(), 500); }
}
