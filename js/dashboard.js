/**
 * Gym Management System (GMS) - Dashboard Controller
 * Dynamically computes and displays statistics, alerts, and quick actions.
 */

const Dashboard = (function () {
  'use strict';

  function init() {
    renderStats();
    renderExpiringAlert();
    renderRecentActivity();
  }

  function renderStats() {
    const stats = GMSStorage.getStats();

    const elTotalMembers = document.getElementById('stat-total-members');
    const elActiveMembers = document.getElementById('stat-active-members');
    const elTotalPlans = document.getElementById('stat-total-plans');
    const elActiveMemberships = document.getElementById('stat-active-memberships');
    const elExpiredMemberships = document.getElementById('stat-expired-memberships');
    const elExpiringSoon = document.getElementById('stat-expiring-soon');

    if (elTotalMembers) elTotalMembers.textContent = stats.totalMembers;
    if (elActiveMembers) elActiveMembers.textContent = stats.activeMembers;
    if (elTotalPlans) elTotalPlans.textContent = stats.totalPlans;
    if (elActiveMemberships) elActiveMemberships.textContent = stats.activeMemberships;
    if (elExpiredMemberships) elExpiredMemberships.textContent = stats.expiredMemberships;
    if (elExpiringSoon) elExpiringSoon.textContent = stats.expiringSoonMemberships;

    // Update sidebar badges if present
    const badgeMembers = document.getElementById('badge-members-count');
    const badgeMemberships = document.getElementById('badge-memberships-count');
    if (badgeMembers) badgeMembers.textContent = stats.totalMembers;
    if (badgeMemberships) badgeMemberships.textContent = stats.activeMemberships;
  }

  function renderExpiringAlert() {
    const alertBox = document.getElementById('dashboard-expiring-alert');
    if (!alertBox) return;

    const memberships = GMSStorage.getMemberships();
    const todayStr = new Date().toISOString().split('T')[0];

    // Find active memberships expiring in <= 7 days and >= 0 days
    const expiringSoonList = memberships.filter(m => {
      if (m.status !== 'Active') return false;
      if (m.expiryDate < todayStr) return false;
      const days = GMSStorage.getDaysRemaining(m.expiryDate);
      return days >= 0 && days <= 7;
    });

    if (expiringSoonList.length > 0) {
      alertBox.style.display = 'flex';
      const countEl = document.getElementById('expiring-count-text');
      if (countEl) {
        countEl.textContent = `${expiringSoonList.length} membership${expiringSoonList.length > 1 ? 's are' : ' is'} expiring within the next 7 days. Action is recommended to renew.`;
      }
    } else {
      alertBox.style.display = 'none';
    }
  }

  function renderRecentActivity() {
    const activityContainer = document.getElementById('dashboard-recent-activity');
    if (!activityContainer) return;

    const members = GMSStorage.getMembers();
    const memberships = GMSStorage.getMemberships();

    // Show latest 3 registered members and latest 3 memberships
    const recentMembers = [...members].reverse().slice(0, 3);
    const recentMemberships = [...memberships].reverse().slice(0, 3);

    let html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
        <div class="table-card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Recently Registered Members</h4>
            <button class="btn btn-sm btn-outline" onclick="App.navigateTo('members')">View All</button>
          </div>
          <table class="data-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              ${recentMembers.length ? recentMembers.map(m => `
                <tr>
                  <td>
                    <div style="font-weight: 600;">${escapeHtml(m.fullName)}</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(m.id)}</div>
                  </td>
                  <td>
                    <span class="badge ${m.status === 'Active' ? 'badge-active' : (m.status === 'Pending' ? 'badge-pending' : 'badge-inactive')}">
                      ${m.status}
                    </span>
                  </td>
                  <td style="color: var(--text-muted);">${m.registrationDate}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No recent members found.</td></tr>
              `}
            </tbody>
          </table>
        </div>

        <div class="table-card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Latest Membership Records</h4>
            <button class="btn btn-sm btn-outline" onclick="App.navigateTo('memberships')">View All</button>
          </div>
          <table class="data-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Member & Plan</th>
                <th>Expires</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${recentMemberships.length ? recentMemberships.map(ms => {
                const daysRemaining = GMSStorage.getDaysRemaining(ms.expiryDate);
                const isSoon = ms.status === 'Active' && daysRemaining >= 0 && daysRemaining <= 7;
                return `
                <tr>
                  <td>
                    <div style="font-weight: 600;">${escapeHtml(ms.memberName)}</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(ms.planName)}</div>
                  </td>
                  <td>
                    <div>${ms.expiryDate}</div>
                    ${isSoon ? `<span class="badge badge-expiring-soon" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">${daysRemaining}d left</span>` : ''}
                  </td>
                  <td>
                    <span class="badge ${ms.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">
                      ${ms.paymentStatus || 'Paid'}
                    </span>
                  </td>
                </tr>
              `;}).join('') : `
                <tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No memberships found.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    activityContainer.innerHTML = html;
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

  return {
    init,
    refresh: init
  };
})();
