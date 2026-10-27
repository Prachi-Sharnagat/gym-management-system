/**
 * Gym Management System (GMS) - Application Shell & Navigation
 * Coordinates routing, modal lifecycle, toast notifications, and UI state.
 */

const App = (function () {
  'use strict';

  let currentView = 'dashboard';

  function init() {
    setupNavigation();
    setupMobileSidebar();
    setupHeaderClock();
    setupGlobalModals();

    // Default to dashboard
    navigateTo('dashboard');
  }

  function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-view-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view-target');
        if (targetView) {
          navigateTo(targetView);
          closeSidebar();
        }
      });
    });
  }

  function navigateTo(viewName) {
    currentView = viewName;

    // Update nav links active state
    document.querySelectorAll('[data-view-target]').forEach(item => {
      if (item.getAttribute('data-view-target') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update view sections visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active-view');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active-view');
    }

    // Update Header Breadcrumb & Title
    const titleMap = {
      'dashboard': { title: 'Dashboard Overview', subtitle: 'Live performance metrics & key gym statistics' },
      'members': { title: 'Member Management', subtitle: 'Register, search, filter, and manage gym members' },
      'plans': { title: 'Membership Plans', subtitle: 'Configure gym subscription tiers and pricing' },
      'memberships': { title: 'Active & Assigned Memberships', subtitle: 'Track member subscriptions, renewals, and expiration dates' }
    };

    const headerTitleEl = document.getElementById('navbar-page-title');
    const headerSubtitleEl = document.getElementById('navbar-page-subtitle');
    if (headerTitleEl && titleMap[viewName]) {
      headerTitleEl.textContent = titleMap[viewName].title;
    }
    if (headerSubtitleEl && titleMap[viewName]) {
      headerSubtitleEl.textContent = titleMap[viewName].subtitle;
    }

    // Module-specific view triggers
    if (viewName === 'dashboard' && typeof Dashboard !== 'undefined') {
      Dashboard.refresh();
    } else if (viewName === 'members' && typeof MemberManagement !== 'undefined') {
      MemberManagement.refresh();
    } else if ((viewName === 'plans' || viewName === 'memberships') && typeof MembershipManagement !== 'undefined') {
      MembershipManagement.refresh();
    }
  }

  function setupMobileSidebar() {
    const toggleBtn = document.getElementById('btn-mobile-toggle');
    const sidebar = document.getElementById('app-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Close on click outside on mobile
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          closeSidebar();
        }
      }
    });
  }

  function closeSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  }

  function setupHeaderClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      clockEl.textContent = now.toLocaleDateString('en-US', options);
    }
    update();
    setInterval(update, 30000);
  }

  function setupGlobalModals() {
    // Backdrop click-to-close for all modals
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    // Close buttons inside modals
    document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) {
          closeModal(modal.id);
        }
      });
    });

    // ESC key closes top open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-backdrop.active');
        if (openModals.length > 0) {
          closeModal(openModals[openModals.length - 1].id);
        }
      }
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      const anyActive = document.querySelectorAll('.modal-backdrop.active').length > 0;
      if (!anyActive) {
        document.body.style.overflow = '';
      }
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info', title = null, duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    let defaultTitle = 'Notification';

    if (type === 'success') {
      defaultTitle = title || 'Success';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      defaultTitle = title || 'Error';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      defaultTitle = title || 'Notice';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      defaultTitle = title || 'Info';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(defaultTitle)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // Confirmation Modal Utility
  let pendingConfirmCallback = null;

  function confirm({ title, message, confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
    const modalEl = document.getElementById('modal-confirmation');
    if (!modalEl) {
      if (window.confirm(message)) {
        if (typeof onConfirm === 'function') onConfirm();
      }
      return;
    }

    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-message');
    const actionBtn = document.getElementById('confirm-modal-action-btn');

    if (titleEl) titleEl.textContent = title || 'Are you sure?';
    if (msgEl) msgEl.textContent = message;
    if (actionBtn) {
      actionBtn.textContent = confirmText;
      actionBtn.className = `btn ${confirmClass}`;
    }

    pendingConfirmCallback = onConfirm;
    openModal('modal-confirmation');
  }

  function handleConfirmAction() {
    closeModal('modal-confirmation');
    if (typeof pendingConfirmCallback === 'function') {
      const cb = pendingConfirmCallback;
      pendingConfirmCallback = null;
      cb();
    }
  }

  // Reset Demo Data trigger
  function handleResetDemoData() {
    confirm({
      title: 'Reset Demo Data?',
      message: 'This will reset all LocalStorage data to the default demonstration dataset (members, plans, memberships). Any custom changes made will be lost.',
      confirmText: 'Reset All Data',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        GMSStorage.resetDemoData();
        showToast('Demo data restored successfully to baseline.', 'success');
        if (typeof Dashboard !== 'undefined') Dashboard.refresh();
        if (typeof MemberManagement !== 'undefined') MemberManagement.refresh();
        if (typeof MembershipManagement !== 'undefined') MembershipManagement.refresh();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    navigateTo,
    openModal,
    closeModal,
    showToast,
    confirm,
    handleConfirmAction,
    handleResetDemoData,
    closeSidebar,
    escapeHtml
  };
})();
