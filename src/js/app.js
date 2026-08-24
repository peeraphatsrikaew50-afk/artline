/**
 * app.js - Main Application Controller, Navigation Router & Event Handlers
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme
  initTheme();

  // 2. Initialize Auth Role Selector UI
  initAuthUI();

  // 3. Initialize Navigation Tabs
  initNavigation();

  // 4. Load Gallery Data
  await galleryComponent.init();
});

function initTheme() {
  const currentTheme = localStorage.getItem('oa_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.innerHTML = currentTheme === 'dark' 
      ? `<i class="fas fa-sun text-amber-400"></i>` 
      : `<i class="fas fa-moon text-indigo-400"></i>`;

    themeBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('oa_theme', theme);
      themeBtn.innerHTML = theme === 'dark' 
        ? `<i class="fas fa-sun text-amber-400"></i>` 
        : `<i class="fas fa-moon text-indigo-400"></i>`;
    });
  }
}

function initAuthUI() {
  const roleSelect = document.getElementById('role-switcher');
  if (roleSelect) {
    roleSelect.value = authManager.currentUser.role;
    roleSelect.addEventListener('change', (e) => {
      authManager.setRole(e.target.value);
    });
  }

  const uploadNavBtn = document.getElementById('nav-btn-upload');
  if (uploadNavBtn) {
    if (!authManager.canUpload()) {
      uploadNavBtn.classList.add('opacity-50');
    }
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.app-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');

      navItems.forEach(n => {
        n.classList.remove('text-purple-400', 'border-b-2', 'border-purple-500');
        n.classList.add('text-slate-400');
      });

      item.classList.remove('text-slate-400');
      item.classList.add('text-purple-400', 'border-b-2', 'border-purple-500');

      sections.forEach(sec => sec.classList.add('hidden'));
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.classList.remove('hidden');
      }

      if (targetId === 'dashboard-section') {
        dashboardComponent.init();
      }
    });
  });
}
