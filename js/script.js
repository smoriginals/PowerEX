/* ═══════════════════════════════════════════════════════
   PowerX Shared JavaScript
   Handles: theme toggle, auth, session, cart, utilities
═══════════════════════════════════════════════════════ */

/* ── 1. THEME ── */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  if (localStorage.getItem('px-theme') === 'light') document.body.classList.add('light');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('px-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

/* ── 2. SESSION HELPERS ── */
function getUser()    { return JSON.parse(localStorage.getItem('px-user') || 'null'); }
function setUser(u)   { localStorage.setItem('px-user', JSON.stringify(u)); }
function clearUser()  { localStorage.removeItem('px-user'); }
function isLoggedIn() { return !!getUser(); }

/* Redirect guards */
function requireAuth(redirect = 'login.html') {
  if (!isLoggedIn()) { window.location.href = redirect; }
}
function redirectIfAuth(redirect = 'dashboard.html') {
  if (isLoggedIn()) { window.location.href = redirect; }
}

/* ── 3. CART HELPERS ── */
function getCart()        { return JSON.parse(localStorage.getItem('px-cart') || '[]'); }
function saveCart(cart)   { localStorage.setItem('px-cart', JSON.stringify(cart)); }
function addToCart(item)  {
  const cart = getCart();
  const idx  = cart.findIndex(c => c.id === item.id);
  if (idx > -1) cart[idx].qty = (cart[idx].qty || 1) + 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
  updateCartBadge();
}
function removeFromCart(id) {
  saveCart(getCart().filter(c => c.id !== id));
  updateCartBadge();
}
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count  = getCart().reduce((s, c) => s + (c.qty || 1), 0);
  badges.forEach(b => { b.textContent = count; b.style.display = count ? 'inline-flex' : 'none'; });
}

/* ── 4. FORM VALIDATION ── */
function validateEmail(v)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function validatePassword(v) { return v.length >= 6; }
function showFieldError(inputEl, msg) {
  inputEl.classList.add('is-invalid');
  const err = inputEl.parentElement.querySelector('.field-error') ||
              inputEl.closest('.mb-3')?.querySelector('.field-error');
  if (err) { err.textContent = msg; err.classList.add('show'); }
}
function clearFieldError(inputEl) {
  inputEl.classList.remove('is-invalid');
  inputEl.classList.add('is-valid');
  const err = inputEl.parentElement.querySelector('.field-error') ||
              inputEl.closest('.mb-3')?.querySelector('.field-error');
  if (err) err.classList.remove('show');
}
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert-auth show ' + (type === 'success' ? 'alert-success-auth' : 'alert-error-auth');
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'alert-auth';
}

/* ── 5. PASSWORD TOGGLE ── */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = btn.closest('.pass-wrap').querySelector('input');
      if (!inp) return;
      const isText = inp.type === 'text';
      inp.type = isText ? 'password' : 'text';
      btn.classList.toggle('fa-eye', isText);
      btn.classList.toggle('fa-eye-slash', !isText);
    });
  });
}

/* ── 6. LOGIN FORM ── */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Simulate-GitHub button
  const ghBtn = document.getElementById('githubBtn');
  if (ghBtn) {
    ghBtn.addEventListener('click', () => {
      showSpinner(ghBtn, 'Connecting…');
      setTimeout(() => {
        const mockUser = { name: 'Google User', email: 'google@powerex.io', avatar: '', via: 'google' };
        setUser(mockUser);
        window.location.href = 'dashboard.html';
      }, 1800);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    hideAlert('loginAlert');
    let valid = true;
    const emailEl = document.getElementById('loginEmail');
    const passEl  = document.getElementById('loginPass');

    if (!validateEmail(emailEl.value))    { showFieldError(emailEl, 'Enter a valid email address.'); valid = false; }
    else clearFieldError(emailEl);
    if (!validatePassword(passEl.value))  { showFieldError(passEl,  'Password must be at least 6 characters.'); valid = false; }
    else clearFieldError(passEl);
    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('px-users') || '[]');
    const found = users.find(u => u.email === emailEl.value.trim() && u.password === passEl.value);
    if (!found) { showAlert('loginAlert', 'Invalid email or password.', 'error'); return; }

    showSpinner(form.querySelector('.btn-auth'), 'Signing in…');
    setTimeout(() => {
      setUser({ name: found.name, email: found.email, avatar: found.avatar || '' });
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}

/* ── 7. SIGNUP FORM ── */
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const ghBtn = document.getElementById('githubBtn');
  if (ghBtn) {
    ghBtn.addEventListener('click', () => {
      showSpinner(ghBtn, 'Connecting…');
      setTimeout(() => {
        const mockUser = { name: 'Google User', email: 'google@powerex.io', avatar: '', via: 'google' };
        setUser(mockUser);
        window.location.href = 'dashboard.html';
      }, 1800);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    hideAlert('signupAlert');
    let valid = true;
    const nameEl  = document.getElementById('signupName');
    const emailEl = document.getElementById('signupEmail');
    const passEl  = document.getElementById('signupPass');
    const confEl  = document.getElementById('signupConf');

    if (!nameEl.value.trim())              { showFieldError(nameEl,  'Full name is required.'); valid = false; }
    else clearFieldError(nameEl);
    if (!validateEmail(emailEl.value))     { showFieldError(emailEl, 'Enter a valid email.'); valid = false; }
    else clearFieldError(emailEl);
    if (!validatePassword(passEl.value))   { showFieldError(passEl,  'At least 6 characters.'); valid = false; }
    else clearFieldError(passEl);
    if (confEl.value !== passEl.value)     { showFieldError(confEl,  'Passwords do not match.'); valid = false; }
    else clearFieldError(confEl);
    if (!valid) return;

    const users = JSON.parse(localStorage.getItem('px-users') || '[]');
    if (users.find(u => u.email === emailEl.value.trim())) {
      showAlert('signupAlert', 'An account with that email already exists.', 'error'); return;
    }

    showSpinner(form.querySelector('.btn-auth'), 'Creating account…');
    setTimeout(() => {
      users.push({ name: nameEl.value.trim(), email: emailEl.value.trim(), password: passEl.value });
      localStorage.setItem('px-users', JSON.stringify(users));
      restoreBtn(form.querySelector('.btn-auth'), '<i class="fa-solid fa-user-plus me-2"></i>Create Account');
      new bootstrap.Modal(document.getElementById('successModal')).show();
    }, 1000);
  });
}

/* ── 8. LOGOUT ── */
function initLogout() {
  const logoutBtns = document.querySelectorAll('.logout-btn');
  const modal = document.getElementById('logoutModal');
  const confirmBtn = document.getElementById('logoutConfirm');

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (modal) { new bootstrap.Modal(modal).show(); }
      else { doLogout(); }
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      doLogout();
    });
  }
}
function doLogout() {
  clearUser();
  window.location.href = 'index.html';
}

/* ── 9. DASHBOARD ── */
function initDashboard() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name || 'Member');
  document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email || '');
  document.querySelectorAll('.user-avatar-letter').forEach(el => {
    el.textContent = (user.name || 'M').charAt(0).toUpperCase();
  });
}

/* ── 10. TRACK ORDER ── */
function initTrackOrder() {
  const form = document.getElementById('trackForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = document.getElementById('trackInput').value.trim();
    const result = document.getElementById('trackResult');
    if (!val) return;
    showSpinner(form.querySelector('button'), 'Tracking…');
    setTimeout(() => {
      restoreBtn(form.querySelector('button'), '<i class="fa-solid fa-magnifying-glass me-2"></i>Track Order');
      const statuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
      const s = statuses[Math.floor(Math.random() * statuses.length)];
      result.innerHTML = `
        <div class="px-card fade-in mt-3">
          <div class="d-flex align-items-center gap-3">
            <i class="fa-solid fa-box-open" style="font-size:2rem;color:var(--gold);"></i>
            <div>
              <div style="font-weight:700;color:var(--gray-900);">Order #${val.toUpperCase()}</div>
              <div class="badge-${s==='Delivered'?'success':s==='Out for Delivery'?'warn':'danger'} mt-1">${s}</div>
              <div style="font-size:.82rem;color:var(--gray-500);margin-top:.3rem;">
                Last updated: ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
              </div>
            </div>
          </div>
        </div>`;
    }, 1400);
  });
}

/* ── UTILS ── */
function showSpinner(btn, txt = 'Loading…') {
  if (!btn) return;
  btn._orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${txt}`;
}
function restoreBtn(btn, html) {
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = html || btn._orig || 'Submit';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initLogout();
  initDashboard();
  initTrackOrder();
  updateCartBadge();

  // Fade-in all .fade-in elements
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.animationDelay = (i * 0.06) + 's';
  });
});
