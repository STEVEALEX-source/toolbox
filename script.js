// Build the two-line heading after the page has loaded.
const heroTitle = document.getElementById('heroTitle');
if (heroTitle) {
  const words = ["A few useful", "<br><span class='accent'>tools.</span>"];
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.innerHTML = word + (i < words.length - 1 ? ' ' : '');
    span.style.animation = `fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${0.4 + i * 0.2}s forwards`;
    span.style.opacity = '0';
    span.style.display = 'inline-block';
    heroTitle.appendChild(span);
  });
}

// Remember the selected colour theme.
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '◐' : '◑';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) {}
  });

  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '◐';
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  } catch(e) {}
}

// Keep the thin progress bar in sync with the page scroll position.
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) progressBar.style.width = progress + '%';
});

// Reveal sections as they enter the viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  if (el.classList.contains('feature-card')) {
    el.style.animationDelay = (i * 0.1) + 's';
  }
  revealObserver.observe(el);
});

document.querySelectorAll('.feature-card[data-modal]').forEach(card => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Add a little depth on pointer devices. Touch layouts keep their normal shape.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--card-tilt-x', `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty('--card-tilt-y', `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty('--glow-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--glow-y', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--card-tilt-x', '0deg');
      card.style.setProperty('--card-tilt-y', '0deg');
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    });
  });
}

// Draw the small pointer trail.
const canvas = document.getElementById('inkTrail');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let dots = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let lastX = 0, lastY = 0;
  document.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.sqrt(dx*dx + dy*dy) > 8) {
      dots.push({ x: e.clientX, y: e.clientY, life: 1, size: Math.random() * 2 + 1 });
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  function animateInk() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots = dots.filter(d => d.life > 0);
    const inkColor = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    dots.forEach(d => {
      ctx.globalAlpha = d.life * 0.3;
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      d.life -= 0.03;
    });
    requestAnimationFrame(animateInk);
  }
  animateInk();
}

// Shared feedback helpers.
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.querySelector('span').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function spawnConfetti(x, y) {
  const colors = ['#d9534f', '#5bc0de', '#f0ad4e', '#5cb85c', '#1a1a1a'];
  for (let i = 0; i < 25; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = x + 'px';
    confetti.style.top = y + 'px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / 25;
    const velocity = 100 + Math.random() * 150;
    confetti.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
    confetti.style.setProperty('--ty', Math.sin(angle) * velocity - 50 + 'px');
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1500);
  }
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => toast(successMsg || 'Copied'))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast(successMsg || 'Copied');
  } catch(e) {
    toast('Value: ' + text);
  }
  document.body.removeChild(ta);
}

// Open and manage tool dialogs.
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

let lastFocusedCard = null;

document.querySelectorAll('.feature-card[data-modal]').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.modal, card));

  const icon = card.querySelector('.feature-icon');
  const arrow = card.querySelector('.card-arrow');
  [icon, arrow].filter(Boolean).forEach(control => {
    control.setAttribute('role', 'button');
    control.setAttribute('tabindex', '0');
    control.setAttribute('aria-label', `Open ${card.querySelector('h3')?.textContent || 'tool'}`);
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      openModal(card.dataset.modal, card);
    });
    control.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openModal(card.dataset.modal, card);
      }
    });
  });
});

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

function openModal(tool, sourceCard, fromHistory = false) {
  if (!modalOverlay || !modalBody || !modalTitle) return;
  lastFocusedCard = sourceCard || document.activeElement;
  if (!fromHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set('tool', tool);
    window.history.pushState({ tool }, '', url);
  }
  const titles = {
    timer: 'Focus Timer',
    tasks: 'Tasks',
    notes: 'Notes',
    password: 'Passwords',
    converter: 'Converter',
    customs: 'Customs Duty',
    color: 'Color Picker',
    calculator: 'Calculator',
    picker: 'Random Picker',
    habits: 'Habit Check'
  };

  modalTitle.textContent = titles[tool] || 'Tool';
  let content = '';

  if (tool === 'timer') {
    content = `<div class="timer-display" id="timerDisplay">25:00</div>
      <div class="btn-row" style="justify-content:center;">
        <button class="btn-sm primary" onclick="timerStart()">Start</button>
        <button class="btn-sm" onclick="timerPause()">Pause</button>
        <button class="btn-sm danger" onclick="timerReset()">Reset</button>
      </div>
      <div class="btn-row" style="justify-content:center;margin-top:1rem;">
        <button class="btn-sm" onclick="timerSet(25)">25 min</button>
        <button class="btn-sm" onclick="timerSet(15)">15 min</button>
        <button class="btn-sm" onclick="timerSet(5)">5 min</button>
        <button class="btn-sm" onclick="timerSet(50)">50 min</button>
      </div>`;
  } else if (tool === 'tasks') {
    content = `<div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
        <input type="text" id="taskInput" placeholder="What needs doing?" onkeypress="if(event.key==='Enter')addTask()">
        <button class="btn-sm primary" onclick="addTask()">Add</button>
      </div>
      <div id="taskList"></div>
      <button class="btn-sm danger" onclick="clearDone()" style="margin-top:0.5rem;">Clear completed</button>`;
  } else if (tool === 'notes') {
    content = `<textarea id="notesArea" placeholder="Jot something down..."></textarea>
      <div class="btn-row">
        <button class="btn-sm" onclick="downloadNotes()">Download</button>
        <button class="btn-sm danger" onclick="clearNotes()">Clear</button>
      </div>`;
  } else if (tool === 'password') {
    content = `<div class="pw-output" id="pwOutput">Click Generate</div>
      <div class="strength-bar"><div class="strength-fill" id="pwStrength"></div></div>
      <label>Length: <span id="pwLenVal">16</span></label>
      <input type="range" id="pwLen" min="6" max="64" value="16" oninput="document.getElementById('pwLenVal').textContent=this.value">
      <div class="checkbox-row">
        <label><input type="checkbox" id="pwUp" checked> Uppercase</label>
        <label><input type="checkbox" id="pwNum" checked> Numbers</label>
        <label><input type="checkbox" id="pwSym" checked> Symbols</label>
      </div>
      <div class="btn-row">
        <button class="btn-sm primary" onclick="genPassword()">Generate</button>
        <button class="btn-sm" onclick="copyPassword()">Copy</button>
      </div>`;
  } else if (tool === 'converter') {
    content = `<select id="convType" onchange="convUpdate()">
        <option value="length">Length</option>
        <option value="weight">Weight</option>
        <option value="temp">Temperature</option>
        <option value="data">Data</option>
        <option value="time">Time</option>
      </select>
      <div style="display:flex;gap:0.5rem;">
        <input type="number" id="convIn" placeholder="Value" oninput="convCalc()" style="flex:2;">
        <select id="convFrom" onchange="convCalc()" style="flex:1;"></select>
        <select id="convTo" onchange="convCalc()" style="flex:1;"></select>
      </div>
      <div class="convert-result" id="convResult">—</div>`;
  } else if (tool === 'customs') {
    content = `<div class="info-note">Figure out what that overseas package will actually cost you.</div>
      <div class="form-row">
        <div class="form-group"><label>Item Value (per unit)</label><input type="number" id="cdValue" placeholder="100.00" step="0.01" oninput="calcCustoms()"></div>
        <div class="form-group"><label>Quantity</label><input type="number" id="cdQty" value="1" min="1" oninput="calcCustoms()"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Shipping Cost</label><input type="number" id="cdShipping" placeholder="25.00" step="0.01" oninput="calcCustoms()"></div>
        <div class="form-group"><label>Insurance</label><input type="number" id="cdInsurance" placeholder="0.00" step="0.01" value="0" oninput="calcCustoms()"></div>
      </div>
      <div class="form-group"><label>Destination Country</label>
        <select id="cdCountry" onchange="calcCustoms()">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="eu">European Union</option>
          <option value="in">India</option>
          <option value="cn">China</option>
          <option value="au">Australia</option>
          <option value="ca">Canada</option>
          <option value="br">Brazil</option>
          <option value="ae">UAE</option>
          <option value="custom">Custom rates</option>
        </select>
      </div>
      <div class="form-group"><label>Product Category</label>
        <select id="cdCategory" onchange="calcCustoms()">
          <option value="general">General Goods (5%)</option>
          <option value="electronics">Electronics (3%)</option>
          <option value="clothing">Clothing and Textiles (15%)</option>
          <option value="food">Food and Beverages (10%)</option>
          <option value="luxury">Luxury Goods (25%)</option>
          <option value="automotive">Automotive Parts (8%)</option>
          <option value="books">Books and Media (0%)</option>
          <option value="custom">Custom duty rate</option>
        </select>
      </div>
      <div class="form-row" id="cdCustomRates" style="display:none;">
        <div class="form-group"><label>Custom Duty %</label><input type="number" id="cdCustomDuty" value="10" step="0.1" oninput="calcCustoms()"></div>
        <div class="form-group"><label>Custom VAT %</label><input type="number" id="cdCustomVat" value="20" step="0.1" oninput="calcCustoms()"></div>
      </div>
      <div class="duty-result" id="dutyResult" style="display:none;"></div>`;
  } else if (tool === 'color') {
    content = `<div class="color-preview" id="colorPreview" style="background:#d9534f;"></div>
      <div style="display:flex;gap:0.5rem;">
        <input type="color" id="colorPick" value="#d9534f" oninput="updateColor(this.value)" style="height:55px;">
        <input type="text" id="colorHex" value="#d9534f" oninput="updateColor(this.value)">
      </div>
      <div class="color-values" id="colorValues"></div>`;
  } else if (tool === 'calculator') {
    content = `<div class="calculator-display" id="calculatorDisplay">0</div>
      <div class="calculator-keys">
        ${['7','8','9','÷','4','5','6','×','1','2','3','−','C','0','.','+','=', '⌫'].map(key => `<button class="calc-key ${key === '=' ? 'primary' : ''}" onclick="calculatorPress('${key}')">${key}</button>`).join('')}
      </div>`;
  } else if (tool === 'picker') {
    content = `<label for="pickerOptions">Options, one per line</label>
      <textarea id="pickerOptions" rows="7" placeholder="Pizza\nPasta\nSomething else"></textarea>
      <div class="btn-row"><button class="btn-sm primary" onclick="pickRandomOption()">Pick one</button><button class="btn-sm" onclick="document.getElementById('pickerOptions').value=''">Clear</button></div>
      <div class="picker-result" id="pickerResult">Add a few options first.</div>`;
  } else if (tool === 'habits') {
    content = `<label for="habitName">What are you keeping up with?</label>
      <input id="habitName" type="text" placeholder="Read, walk, stretch...">
      <div class="habit-week" id="habitWeek"></div>
      <div class="btn-row"><button class="btn-sm primary" onclick="saveHabit()">Save habit</button><button class="btn-sm danger" onclick="resetHabit()">Reset</button></div>`;
  }

  modalBody.innerHTML = content;
  modalBody.classList.add('loading-sweep');
  const skeleton = document.createElement('div');
  skeleton.className = 'modal-skeleton';
  skeleton.innerHTML = '<span></span><span></span><span></span>';
  modalBody.appendChild(skeleton);
  setTimeout(() => {
    modalBody.classList.remove('loading-sweep');
    skeleton.remove();
  }, 260);
  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  if (tool === 'tasks') renderTasks();
  if (tool === 'notes') loadNotes();
  if (tool === 'converter') convUpdate();
  if (tool === 'color') updateColor('#d9534f');
  if (tool === 'customs') calcCustoms();
  if (tool === 'habits') renderHabit();
  if (tool === 'calculator') calculatorRender();
  requestAnimationFrame(() => {
    const firstControl = modalBody.querySelector('input, textarea, select, button');
    if (firstControl) firstControl.focus();
  });
}

function closeModal(fromHistory = false) {
  if (!modalOverlay || !modalOverlay.classList.contains('active')) return;
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (lastFocusedCard && typeof lastFocusedCard.focus === 'function') lastFocusedCard.focus();
  if (!fromHistory) {
    const url = new URL(window.location.href);
    if (url.searchParams.has('tool')) {
      url.searchParams.delete('tool');
      window.history.pushState({}, '', url);
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Focus timer.
let timerSec = 1500, timerOrig = 1500, timerInterval = null;

function timerFmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function timerRender() {
  const el = document.getElementById('timerDisplay');
  if (el) {
    el.textContent = timerFmt(timerSec);
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }
}

function timerSet(m) {
  timerSec = m * 60;
  timerOrig = timerSec;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRender();
}

function timerStart() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timerSec <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      toast('Time is up');
      const el = document.getElementById('timerDisplay');
      if (el) {
        const rect = el.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
      }
      return;
    }
    timerSec--;
    timerRender();
  }, 1000);
}

function timerPause() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function timerReset() {
  timerPause();
  timerSec = timerOrig;
  timerRender();
}

// Task list.
let tasks = [];
try { tasks = JSON.parse(localStorage.getItem('tasks') || '[]'); } catch(e) {}

function saveTasks() {
  try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch(e) {}
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  let html = '';
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    html += `<div class="todo-item ${t.done ? 'done' : ''}" style="animation-delay:${i*0.05}s">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i}, this)">
      <span>${t.text.replace(/</g, '&lt;')}</span>
      <button class="btn-sm danger" onclick="deleteTask(${i}, this)">×</button>
    </div>`;
  }
  list.innerHTML = html || '<p style="color:var(--ink-3);text-align:center;padding:2rem;font-size:1.2rem;font-family:var(--font-note);">No tasks yet. Add one above.</p>';
}

function addTask() {
  const inp = document.getElementById('taskInput');
  if (!inp || !inp.value.trim()) return;
  tasks.unshift({ text: inp.value.trim(), done: false });
  inp.value = '';
  saveTasks();
  renderTasks();
  toast('Task added');
}

function toggleTask(i, checkbox) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  renderTasks();
  if (tasks[i].done && checkbox) {
    const rect = checkbox.getBoundingClientRect();
    spawnConfetti(rect.left + 10, rect.top + 10);
  }
}

function deleteTask(i, btn) {
  const item = btn.parentElement;
  item.classList.add('removing');
  setTimeout(() => {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
  }, 400);
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
  toast('Cleared');
}

// Notes editor.
function loadNotes() {
  const area = document.getElementById('notesArea');
  if (!area) return;
  try { area.value = localStorage.getItem('notes') || ''; } catch(e) {}
  area.oninput = () => {
    try { localStorage.setItem('notes', area.value); } catch(e) {}
  };
}

function downloadNotes() {
  const text = document.getElementById('notesArea').value;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
  a.download = 'notes-' + new Date().toISOString().slice(0, 10) + '.txt';
  a.click();
  toast('Downloaded');
}

function clearNotes() {
  if (confirm('Clear all notes?')) {
    document.getElementById('notesArea').value = '';
    try { localStorage.setItem('notes', ''); } catch(e) {}
    toast('Cleared');
  }
}

// Password generator.
let lastPw = '';

function genPassword() {
  const output = document.getElementById('pwOutput');
  if (!output) return;
  output.classList.add('generating');
  setTimeout(() => {
    const len = parseInt(document.getElementById('pwLen').value);
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('pwUp').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('pwNum').checked) chars += '0123456789';
    if (document.getElementById('pwSym').checked) chars += '!@#$%^&*()_+-=[]{}';

    const pools = [
      'abcdefghijklmnopqrstuvwxyz',
      document.getElementById('pwUp').checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      document.getElementById('pwNum').checked ? '0123456789' : '',
      document.getElementById('pwSym').checked ? '!@#$%^&*()_+-=[]{}' : ''
    ].filter(Boolean);
    const randomIndex = max => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0] % max;
    };
    const selected = pools.map(pool => pool[randomIndex(pool.length)]);
    const allChars = pools.join('');
    while (selected.length < len) selected.push(allChars[randomIndex(allChars.length)]);
    for (let i = selected.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
    const pw = selected.join('');

    lastPw = pw;
    output.textContent = pw;
    output.classList.remove('generating');

    let score = 0;
    if (len >= 12) score++;
    if (len >= 16) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const colors = ['#d9534f', '#f0ad4e', '#f0ad4e', '#5cb85c', '#5cb85c', '#5bc0de'];
    const fill = document.getElementById('pwStrength');
    fill.style.width = (score * 20) + '%';
    fill.style.background = colors[score];
  }, 300);
}

function copyPassword() {
  if (!lastPw) return;
  copyToClipboard(lastPw, 'Copied');
}

// Unit converter.
const units = {
  length: {m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, 'in':0.0254},
  weight: {kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, t:1000},
  data: {B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776},
  time: {s:1, min:60, h:3600, day:86400, week:604800, year:31536000}
};

function convUpdate() {
  const type = document.getElementById('convType').value;
  const from = document.getElementById('convFrom');
  const to = document.getElementById('convTo');
  let html = '';

  if (type === 'temp') {
    html = '<option>C</option><option>F</option><option>K</option>';
  } else {
    for (const k in units[type]) html += `<option>${k}</option>`;
  }

  from.innerHTML = html;
  to.innerHTML = html;
  if (to.options.length > 1) to.selectedIndex = 1;
  convCalc();
}

function convCalc() {
  const type = document.getElementById('convType').value;
  const v = parseFloat(document.getElementById('convIn').value);
  const res = document.getElementById('convResult');

  if (isNaN(v)) { res.textContent = '—'; return; }

  const f = document.getElementById('convFrom').value;
  const t = document.getElementById('convTo').value;
  let r;

  if (type === 'temp') {
    const c = f === 'C' ? v : f === 'F' ? (v - 32) * 5 / 9 : v - 273.15;
    r = t === 'C' ? c : t === 'F' ? c * 9 / 5 + 32 : c + 273.15;
  } else {
    r = v * units[type][f] / units[type][t];
  }

  res.textContent = `${v} ${f} = ${r.toFixed(4)} ${t}`;
  res.classList.remove('updated');
  void res.offsetWidth;
  res.classList.add('updated');
}

// Customs estimate.
const countryVat = { us: 0, uk: 20, eu: 21, in: 18, cn: 13, au: 10, ca: 5, br: 17, ae: 5, custom: 0 };
const categoryDuty = { general: 5, electronics: 3, clothing: 15, food: 10, luxury: 25, automotive: 8, books: 0, custom: 0 };

function calcCustoms() {
  const value = parseFloat(document.getElementById('cdValue').value) || 0;
  const qty = parseInt(document.getElementById('cdQty').value) || 1;
  const shipping = parseFloat(document.getElementById('cdShipping').value) || 0;
  const insurance = parseFloat(document.getElementById('cdInsurance').value) || 0;
  const country = document.getElementById('cdCountry').value;
  const category = document.getElementById('cdCategory').value;

  const customRates = document.getElementById('cdCustomRates');
  if (customRates) customRates.style.display = (category === 'custom' || country === 'custom') ? 'grid' : 'none';

  let vatRate = countryVat[country] || 0;
  let dutyRate = categoryDuty[category] || 0;

  if (category === 'custom' || country === 'custom') {
    const cd = document.getElementById('cdCustomDuty');
    const cv = document.getElementById('cdCustomVat');
    if (cd) dutyRate = parseFloat(cd.value) || 0;
    if (cv) vatRate = parseFloat(cv.value) || 0;
  }

  const subtotal = value * qty;
  const cif = subtotal + shipping + insurance;
  const duty = cif * (dutyRate / 100);
  const taxable = cif + duty;
  const vat = taxable * (vatRate / 100);
  const total = taxable + vat;

  const result = document.getElementById('dutyResult');
  if (!result) return;

  if (value <= 0) { result.style.display = 'none'; return; }

  result.style.display = 'block';
  result.innerHTML = `<h4>Cost Breakdown</h4>
    <div class="duty-row"><span class="label">Item Subtotal (${qty} x ${value.toFixed(2)})</span><span class="value">$${subtotal.toFixed(2)}</span></div>
    <div class="duty-row"><span class="label">Shipping</span><span class="value">$${shipping.toFixed(2)}</span></div>
    <div class="duty-row"><span class="label">Insurance</span><span class="value">$${insurance.toFixed(2)}</span></div>
    <div class="duty-row"><span class="label">CIF Value</span><span class="value">$${cif.toFixed(2)}</span></div>
    <div class="duty-row"><span class="label">Duty (${dutyRate}%)</span><span class="value">$${duty.toFixed(2)}</span></div>
    <div class="duty-row"><span class="label">VAT or GST (${vatRate}%)</span><span class="value">$${vat.toFixed(2)}</span></div>
    <div class="duty-row total"><span class="label">Total Landed Cost</span><span class="value">$${total.toFixed(2)}</span></div>`;
}

// Colour picker.
function updateColor(v) {
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;

  document.getElementById('colorPick').value = v;
  document.getElementById('colorHex').value = v;
  document.getElementById('colorPreview').style.background = v;

  const r = parseInt(v.substr(1, 2), 16);
  const g = parseInt(v.substr(3, 2), 16);
  const b = parseInt(v.substr(5, 2), 16);

  const rN = r/255, gN = g/255, bN = b/255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h, s, l = (max + min) / 2;

  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6; break;
      case gN: h = ((bN - rN) / d + 2) / 6; break;
      case bN: h = ((rN - gN) / d + 4) / 6; break;
    }
  }

  const hsl = [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];

  document.getElementById('colorValues').innerHTML = `
    <div class="color-val" onclick="copyVal('${v.toUpperCase()}')"><small>HEX</small>${v.toUpperCase()}</div>
    <div class="color-val" onclick="copyVal('rgb(${r}, ${g}, ${b})')"><small>RGB</small>rgb(${r}, ${g}, ${b})</div>
    <div class="color-val" onclick="copyVal('hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)')"><small>HSL</small>hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)</div>
  `;
}

function copyVal(text) {
  copyToClipboard(text, 'Copied: ' + text);
}


// Move the main page layers slightly with the pointer.
(() => {
  const sceneTargets = [document.querySelector('.hero'), document.querySelector('.features')].filter(Boolean);
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return;

  const resetScene = () => {
    sceneTargets.forEach(scene => {
      scene.style.setProperty('--scene-x', '0deg');
      scene.style.setProperty('--scene-y', '0deg');
      scene.style.setProperty('--scene-z', '0px');
    });
  };

  document.addEventListener('pointermove', (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    sceneTargets.forEach(scene => {
      scene.style.setProperty('--scene-x', `${(y * -2.2).toFixed(2)}deg`);
      scene.style.setProperty('--scene-y', `${(x * 2.2).toFixed(2)}deg`);
      scene.style.setProperty('--scene-z', `${(Math.abs(x) + Math.abs(y)) * -2}px`);
    });
  });

  document.addEventListener('pointerleave', resetScene);
})();


// Draw the background scene on a canvas.
(() => {
  const canvas = document.getElementById('scene3d');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let objects = [];
  let bursts = [];
  let audioContext = null;

  const palette = ['#8fc8c2', '#f1d58a', '#f1c3bd', '#b5a7e8', '#a9d6e5'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeObject(i) {
    return {
      x: (Math.random() - 0.5) * 1500,
      y: (Math.random() - 0.5) * 900,
      z: Math.random() * 900 + 150,
      size: Math.random() * 35 + 18,
      speed: Math.random() * 0.3 + 0.08,
      spin: Math.random() * 0.02 - 0.01,
      angle: Math.random() * Math.PI * 2,
      color: palette[i % palette.length],
      type: i % 3
    };
  }

  function project(x, y, z) {
    const focal = 680;
    const scale = focal / (focal + z);
    return {
      x: width / 2 + x * scale,
      y: height / 2 + y * scale,
      scale
    };
  }

  function line(a, b, color, alpha = 0.5, lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawWireCube(object, center, size) {
    const s = size;
    const vertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
    ];
    const cos = Math.cos(object.angle);
    const sin = Math.sin(object.angle);
    const points = vertices.map(([x, y, z]) => {
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      return project(center.x + rx, center.y + y, object.z + rz);
    });
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    edges.forEach(([a, b]) => line(points[a], points[b], object.color, 0.48, Math.max(1, 2 * center.scale)));
  }

  function drawDiamond(object, center, size) {
    const points = [
      project(center.x, center.y - size, object.z),
      project(center.x + size, center.y, object.z),
      project(center.x, center.y + size, object.z),
      project(center.x - size, center.y, object.z),
      project(center.x, center.y, object.z - size),
      project(center.x, center.y, object.z + size)
    ];
    [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4],[0,5],[1,5],[2,5],[3,5]].forEach(([a,b], index) => {
      line(points[a], points[b], object.color, index > 7 ? 0.22 : 0.42, 1.4);
    });
  }

  function drawRing(object, center, size) {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(object.angle);
    ctx.strokeStyle = object.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2 * center.scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * center.scale, size * 0.38 * center.scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function addBurst(x, y) {
    const originX = x / width * 2 - 1;
    const originY = y / height * 2 - 1;
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * (1 + Math.random() * 2.2),
        vy: Math.sin(angle) * (1 + Math.random() * 2.2),
        life: 1,
        size: Math.random() * 3 + 2,
        color: palette[i % palette.length],
        depth: 1 - Math.abs(originX + originY) * 0.12
      });
    }
  }

  function playClickTone() {
    if (reduce) return;
    try {
      audioContext ||= new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(420, audioContext.currentTime + 0.06);
      gain.gain.setValueAtTime(0.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {}
  }

  function drawBursts() {
    bursts = bursts.filter(particle => particle.life > 0);
    bursts.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life -= 0.018;
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;

    const gradient = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.7);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
    gradient.addColorStop(1, 'rgba(169, 214, 229, 0.03)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const sorted = [...objects].sort((a, b) => b.z - a.z);
    sorted.forEach(object => {
      object.z -= object.speed;
      object.angle += object.spin;
      if (object.z < -220) object.z = 1100;
      const parallaxX = pointer.x * (1 - object.z / 1100) * 45;
      const parallaxY = pointer.y * (1 - object.z / 1100) * 30;
      const center = project(object.x + parallaxX, object.y + parallaxY, object.z);
      const size = object.size * center.scale;
      if (object.type === 0) drawWireCube(object, center, size);
      if (object.type === 1) drawDiamond(object, center, size);
      if (object.type === 2) drawRing(object, center, size);
    });

    drawBursts();

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  for (let i = 0; i < 28; i++) objects.push(makeObject(i));
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', event => {
    pointer.targetX = event.clientX / width * 2 - 1;
    pointer.targetY = event.clientY / height * 2 - 1;
  });
  window.addEventListener('pointerdown', event => {
    addBurst(event.clientX, event.clientY);
    playClickTone();
  });

  if (reduce) {
    objects = objects.slice(0, 10);
  }
  draw();
})();


// Keep breadcrumbs and interaction status up to date.
(() => {
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const breadcrumbStatus = document.getElementById('breadcrumbStatus');
  const featuresSection = document.getElementById('features');
  const aboutSection = document.getElementById('about');
  const heroSection = document.querySelector('.hero');

  function setBreadcrumb(label, status = 'Ready') {
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = label;
    if (breadcrumbStatus) breadcrumbStatus.textContent = status;
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target === featuresSection) setBreadcrumb('Tools', 'Choose a tool');
      if (entry.target === aboutSection) setBreadcrumb('About', 'Local by default');
      if (entry.target === heroSection) setBreadcrumb('Home', 'Ready');
    });
  }, { threshold: 0.35 });

  [heroSection, featuresSection, aboutSection].filter(Boolean).forEach(section => sectionObserver.observe(section));

  document.querySelectorAll('.button, .main-nav a, .breadcrumbs a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.textContent.includes('tool')) setBreadcrumb('Tools', 'Opening tools');
    });
  });

  const toolsButton = document.querySelector('.button[href="#features"]');
  if (toolsButton && featuresSection) {
    toolsButton.addEventListener('click', (event) => {
      event.preventDefault();
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState({}, '', '#features');
      setBreadcrumb('Tools', 'Choose a tool');
    });
  }

  function showSkeleton(container) {
    if (!container) return;
    container.classList.add('is-loading');
    const skeleton = document.createElement('div');
    skeleton.className = 'tool-skeleton';
    skeleton.setAttribute('aria-label', 'Loading tool');
    skeleton.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(skeleton);
    setTimeout(() => {
      skeleton.remove();
      container.classList.remove('is-loading');
    }, 180);
  }

  document.querySelectorAll('.feature-card[data-modal]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      setBreadcrumb('Tools', card.querySelector('h3')?.textContent || 'Choose a tool');
    });
    card.addEventListener('mouseleave', () => {
      setBreadcrumb('Tools', 'Choose a tool');
    });
  });
})();


// Calculator, random picker, and habit tracker.
let calculatorValue = '';
let calculatorStored = null;
let calculatorOperator = null;

function calculatorRender() {
  const display = document.getElementById('calculatorDisplay');
  if (display) display.textContent = calculatorValue || '0';
}

function calculatorPress(key) {
  const display = document.getElementById('calculatorDisplay');
  if (!display) return;
  if (/^\d$/.test(key) || key === '.') {
    if (key === '.' && calculatorValue.includes('.')) return;
    calculatorValue = calculatorValue === '0' ? key : calculatorValue + key;
  } else if (key === 'C') {
    calculatorValue = '';
    calculatorStored = null;
    calculatorOperator = null;
  } else if (key === '⌫') {
    calculatorValue = calculatorValue.slice(0, -1);
  } else if (['+', '−', '×', '÷'].includes(key)) {
    calculatorStored = parseFloat(calculatorValue || '0');
    calculatorOperator = key;
    calculatorValue = '';
  } else if (key === '=') {
    const current = parseFloat(calculatorValue || '0');
    if (calculatorStored === null || !calculatorOperator) return;
    const operations = {
      '+': (a, b) => a + b,
      '−': (a, b) => a - b,
      '×': (a, b) => a * b,
      '÷': (a, b) => b === 0 ? NaN : a / b
    };
    const result = operations[calculatorOperator](calculatorStored, current);
    calculatorValue = Number.isFinite(result) ? String(Number(result.toFixed(8))) : 'Cannot divide by 0';
    calculatorStored = null;
    calculatorOperator = null;
  }
  display.textContent = calculatorValue || '0';
}

function pickRandomOption() {
  const input = document.getElementById('pickerOptions');
  const result = document.getElementById('pickerResult');
  if (!input || !result) return;
  const options = input.value.split('\n').map(item => item.trim()).filter(Boolean);
  if (!options.length) {
    result.textContent = 'Add a few options first.';
    return;
  }
  result.textContent = options[Math.floor(Math.random() * options.length)];
  result.classList.remove('picker-pop');
  void result.offsetWidth;
  result.classList.add('picker-pop');
}

function habitKey() {
  return 'toolbox-habit';
}

function getHabit() {
  try {
    return JSON.parse(localStorage.getItem(habitKey())) || { name: '', days: {} };
  } catch (error) {
    return { name: '', days: {} };
  }
}

function saveHabit() {
  const input = document.getElementById('habitName');
  if (!input || !input.value.trim()) return;
  const habit = getHabit();
  habit.name = input.value.trim();
  try { localStorage.setItem(habitKey(), JSON.stringify(habit)); } catch (error) {}
  renderHabit();
  toast('Habit saved');
}

function renderHabit() {
  const input = document.getElementById('habitName');
  const week = document.getElementById('habitWeek');
  if (!week) return;
  const habit = getHabit();
  if (input) input.value = habit.name || '';
  const today = new Date();
  week.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
    return `<button class="habit-day ${habit.days[key] ? 'done' : ''}" onclick="toggleHabitDay('${key}')"><span>${label}</span><b>${habit.days[key] ? '✓' : '·'}</b></button>`;
  }).join('');
}

function toggleHabitDay(key) {
  const habit = getHabit();
  habit.days[key] = !habit.days[key];
  try { localStorage.setItem(habitKey(), JSON.stringify(habit)); } catch (error) {}
  renderHabit();
}

function resetHabit() {
  try { localStorage.removeItem(habitKey()); } catch (error) {}
  renderHabit();
  toast('Habit reset');
}


// Restore a tool from the URL and keep browser history working.
(() => {
  const validTools = new Set(['timer', 'tasks', 'notes', 'password', 'converter', 'customs', 'color', 'calculator', 'picker', 'habits']);

  function openFromUrl() {
    const tool = new URL(window.location.href).searchParams.get('tool');
    if (!validTools.has(tool)) return;
    const card = document.querySelector(`[data-modal="${tool}"]`);
    openModal(tool, card, true);
  }

  window.addEventListener('popstate', () => {
    const tool = new URL(window.location.href).searchParams.get('tool');
    if (tool && validTools.has(tool)) openFromUrl();
    else closeModal(true);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openFromUrl, { once: true });
  } else {
    openFromUrl();
  }
})();

