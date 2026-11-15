/**
 * Alka Refrigeration — Admin Dashboard JS
 * Handles all admin panel functionality:
 * - Authentication check
 * - Complaint management (view, status updates, confirm, amount, cancel with reason)
 * - Customer listing
 * - Coupon creation
 * - Report downloads
 * - Dashboard stats
 */

// =============================================
// Configuration
// =============================================
const API_BASE = window.API_BASE || 'https://alka-backend.onrender.com/api';
let adminToken  = null;
let adminUser   = null;
let allComplaints  = [];
let currentFilter  = 'Pending';

// =============================================
// Initialization addEventListener() is a JavaScript method used to listen for events on HTML elements. clicking a button
// typing in an input
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

function checkAdminAuth() {
  adminToken = localStorage.getItem('alka_token');
  const savedUser = localStorage.getItem('alka_user');

  if (!adminToken || !savedUser) {      //If token OR user data does not exist...
    showToast('Please login first.', 'warning');
    setTimeout(() => window.location.href = 'index.html', 1500);   //Wait 1500 milliseconds (1.5 seconds),
//then send user to login page.
    return;
  }
// showToast() is usually a custom JavaScript function used to display a small notification message on the screen.

// A toast message is that small popup that appears for a few seconds like:
  try {
    adminUser = JSON.parse(savedUser);   //Convert saved text data into JavaScript object.
  } catch (e) {                            //If parsing fails due to invalid JSON...
    showToast('Session error. Please login again.', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  if (adminUser.role !== 'admin') {   //if not admin denied
    showToast('Access denied. Admin privileges required.', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  // Update topbar
  const avatar = document.querySelector('.topbar-avatar');   //Find the HTML element whose class name is topbar-avatar
//and store it inside variable avatar.
  const nameEl = document.querySelector('.topbar-name');
  if (avatar && adminUser.picture) avatar.src = adminUser.picture;
  if (nameEl) nameEl.textContent = adminUser.name;

  // Load initial data
  loadDashboard();
  loadComplaints();
  loadCustomers();

  // Auto-refresh every 30 seconds
  setInterval(() => {
    loadDashboard();
    loadComplaints();
  }, 30000);    //30000 milliseconds = 30 seconds
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  };
}

// =============================================
// Section Navigation
// =============================================
function switchSection(section) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === section) link.classList.add('active');
  });

  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.add('active');

  const titles = {
    dashboard:  'Dashboard',
    complaints: 'Complaint Management',
    customers:  'Customer Management',
    coupons:    'Coupon Management',
    reports:    'Reports & Export',
  };
  document.getElementById('page-title').textContent = titles[section] || 'Dashboard';
}

function toggleSidebar() {
  document.getElementById('admin-sidebar').classList.toggle('open');
}

// =============================================
// Dashboard Stats
// =============================================
async function loadDashboard() {
  try {
    const res  = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const { stats } = data;
    document.getElementById('stat-total').textContent     = stats.totalComplaints;
    document.getElementById('stat-pending').textContent   = stats.pendingComplaints;
    document.getElementById('stat-completed').textContent = stats.completedComplaints;
    document.getElementById('stat-customers').textContent = stats.totalCustomers;
    document.getElementById('stat-revenue').textContent   = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
  } catch (error) {
    console.error('Load dashboard error:', error);
  }
}

// =============================================
// Complaint Management
// =============================================
async function loadComplaints() {
  try {
    const res  = await fetch(`${API_BASE}/admin/complaints`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    allComplaints = data.complaints;
    renderComplaints();
    renderRecentComplaints();
  } catch (error) {
    console.error('Load complaints error:', error);
    document.getElementById('complaints-list').innerHTML = `
      <div class="no-data">
        <div class="no-data-icon">⚠️</div>
        <h3>Failed to load complaints</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function filterComplaints(status) {
  currentFilter = status;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (status === 'Pending')    document.getElementById('tab-pending').classList.add('active');
  else if (status === 'Done')  document.getElementById('tab-done').classList.add('active');
  else                         document.getElementById('tab-all').classList.add('active');
  renderComplaints();
}

function renderComplaints() {
  const container = document.getElementById('complaints-list');
  let filtered    = allComplaints;

  if (currentFilter) {
    filtered = allComplaints.filter(c => c.workStatus === currentFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <div class="no-data-icon">📋</div>
        <h3>No complaints found</h3>
        <p>${currentFilter ? `No ${currentFilter.toLowerCase()} complaints.` : 'No complaints yet.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => renderComplaintCard(c)).join('');
}

function renderRecentComplaints() {
  const container = document.getElementById('dashboard-recent-list');
  const recent    = allComplaints.slice(0, 6);

  if (recent.length === 0) {
    container.innerHTML = '<div class="no-data"><p>No complaints yet.</p></div>';
    return;
  }

  container.innerHTML = recent.map(c => renderComplaintCard(c)).join('');
}

function renderComplaintCard(c) {
  const date           = c.preferredDate
    ? new Date(c.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const statusClass    = `badge-${c.status.toLowerCase().replace(/ /g, '-')}`;
  const callChipClass  = c.callStatus === 'Called'           ? 'chip-call-done'      : 'chip-not-called';
  const confirmChipClass = c.isConfirmed                     ? 'chip-confirmed'      : 'chip-not-confirmed';
  const techChipClass  = c.technicianStatus === 'On The Way' ? 'chip-on-way'         : 'chip-not-assigned';

  const isPending    = c.workStatus === 'Pending';
  const isCancelled  = c.status === 'Cancelled';

  // Cancellation note
  let cancelNote = '';
  if (isCancelled) {
    const by     = c.cancelledBy === 'Admin' ? 'Cancelled by Alka Refrigeration' : 'Cancelled by Customer';
    const reason = c.cancelReason ? ` — ${c.cancelReason}` : '';
    cancelNote = `
      <div class="complaint-cancel-note">
        ❌ ${by}${reason}
      </div>
    `;
  }

  // Instructions
  const instructionsHtml = c.instructions
    ? `<div class="complaint-detail">
         <div class="detail-label">Instructions</div>
         <div class="detail-value">${c.instructions}</div>
       </div>`
    : '';

  return `
    <div class="complaint-card-admin">
      <div class="complaint-header">
        <div class="complaint-customer">
          <h4>${c.name}</h4>
          <div class="customer-meta">
            📞 <a href="tel:${c.mobile}">${c.mobile}</a> &bull; 📍 ${c.location}
          </div>
        </div>
        <span class="complaint-badge ${statusClass}">${c.status}</span>
      </div>

      <div class="complaint-details">
        <div class="complaint-detail">
          <div class="detail-label">Service</div>
          <div class="detail-value">${c.serviceType}</div>
        </div>
        <div class="complaint-detail">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${date} • ${c.preferredTime}</div>
        </div>
        <div class="complaint-detail">
          <div class="detail-label">Amount</div>
          <div class="detail-value">₹${c.amount || 0}</div>
        </div>
        <div class="complaint-detail">
          <div class="detail-label">Payment</div>
          <div class="detail-value">${c.paymentStatus}</div>
        </div>
        ${instructionsHtml}
      </div>

      ${cancelNote}

      <div class="complaint-status-row">
        <span class="status-chip ${callChipClass}">📞 ${c.callStatus}</span>
        <span class="status-chip ${confirmChipClass}">${c.isConfirmed ? '✅ Confirmed' : '⏳ Not Confirmed'}</span>
        <span class="status-chip ${techChipClass}">🚗 ${c.technicianStatus}</span>
      </div>

      ${isPending && !isCancelled ? `
      <div class="complaint-actions">
        ${c.callStatus === 'Not Called'
          ? `<button class="btn-action btn-call" onclick="updateStatus('${c._id}', { callStatus: 'Called' })">📞 Mark Called</button>`
          : ''}
        ${c.callStatus === 'Called' && !c.isConfirmed
          ? `<button class="btn-action btn-confirm" onclick="confirmComplaint('${c._id}')">✅ Confirm</button>`
          : ''}
        ${c.isConfirmed && c.technicianStatus === 'Not Assigned'
          ? `<button class="btn-action btn-on-way" onclick="updateStatus('${c._id}', { technicianStatus: 'On The Way' })">🚗 On The Way</button>`
          : ''}
        <button class="btn-action btn-amount" onclick="openAmountModal('${c._id}', ${c.amount || 0})">💰 Set Amount</button>
        <button class="btn-action btn-done" onclick="updateStatus('${c._id}', { workStatus: 'Done' })">✅ Mark Done</button>
        <button class="btn-action btn-not-done" onclick="updateStatus('${c._id}', { workStatus: 'Pending' })">❌ Not Done</button>
        <button class="btn-action btn-cancel-admin" onclick="openAdminCancelModal('${c._id}')">🚫 Cancel Booking</button>
      </div>
      ` : !isCancelled ? `
      <div class="complaint-actions">
        <button class="btn-action btn-not-done" onclick="updateStatus('${c._id}', { workStatus: 'Pending' })">↩️ Reopen</button>
        <button class="btn-action btn-amount" onclick="openAmountModal('${c._id}', ${c.amount || 0})">💰 Update Amount</button>
        <button class="btn-action btn-cancel-admin" onclick="openAdminCancelModal('${c._id}')">🚫 Cancel Booking</button>
      </div>
      ` : ''}
    </div>
  `;
}

// ─────────────────────────────────────────────
// Status Updates
// ─────────────────────────────────────────────
async function updateStatus(complaintId, updates) {
  try {
    const res  = await fetch(`${API_BASE}/admin/complaint/${complaintId}/update-status`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
      body:    JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast(data.message, 'success');
    loadComplaints();
    loadDashboard();
  } catch (error) {
    showToast(error.message || 'Failed to update status', 'error');
  }
}

async function confirmComplaint(complaintId) {
  try {
    const res  = await fetch(`${API_BASE}/admin/complaint/${complaintId}/confirm`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Complaint confirmed! ✅', 'success');
    loadComplaints();
    loadDashboard();
  } catch (error) {
    showToast(error.message || 'Failed to confirm', 'error');
  }
}

// =============================================
// Amount Modal
// =============================================
function openAmountModal(complaintId, currentAmount) {
  document.getElementById('amount-complaint-id').value = complaintId;
  document.getElementById('amount-input').value        = currentAmount || '';
  document.getElementById('amount-modal').style.display = 'flex';
}

function closeAmountModal() {
  document.getElementById('amount-modal').style.display = 'none';
}

async function submitAmount() {
  const complaintId = document.getElementById('amount-complaint-id').value;
  const amount      = parseFloat(document.getElementById('amount-input').value);

  if (isNaN(amount) || amount < 0) {
    showToast('Please enter a valid amount', 'warning');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/admin/complaint/${complaintId}/update-amount`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast(`Amount updated to ₹${amount}`, 'success');
    closeAmountModal();
    loadComplaints();
  } catch (error) {
    showToast(error.message || 'Failed to update amount', 'error');
  }
}

// =============================================
// Admin Cancel Booking Modal
// =============================================
let adminCancelComplaintId = null;

function openAdminCancelModal(complaintId) {
  adminCancelComplaintId = complaintId;
  document.getElementById('admin-cancel-reason').value = '';
  document.getElementById('admin-cancel-modal').style.display = 'flex';
}

function closeAdminCancelModal() {
  document.getElementById('admin-cancel-modal').style.display = 'none';
  adminCancelComplaintId = null;
}

async function submitAdminCancel() {
  const reason = document.getElementById('admin-cancel-reason').value.trim();
  if (!reason) {
    showToast('Please enter a reason for cancellation.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-admin-cancel-submit');
  btn.disabled    = true;
  btn.textContent = 'Cancelling...';

  try {
    const res  = await fetch(`${API_BASE}/admin/complaint/${adminCancelComplaintId}/cancel`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Booking cancelled by admin. 🚫', 'success');
    closeAdminCancelModal();
    loadComplaints();
    loadDashboard();
  } catch (error) {
    showToast(error.message || 'Failed to cancel booking', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Confirm Cancel';
  }
}

// =============================================
// Customer Management
// =============================================
async function loadCustomers() {
  try {
    const res  = await fetch(`${API_BASE}/admin/customers`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody      = document.getElementById('customers-tbody');
    const userSelect = document.getElementById('coupon-user');

    if (!data.customers || data.customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#8890a7;">No customers yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.customers.map((c, i) => {
      const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A';
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.mobile || 'N/A'}</td>
          <td>${c.location || 'N/A'}</td>
          <td>${date}</td>
        </tr>
      `;
    }).join('');

    // Populate coupon user dropdown
    if (userSelect) {
      const existing = userSelect.querySelectorAll('option:not(:first-child)');
      existing.forEach(opt => opt.remove());
      data.customers.forEach(c => {
        const option       = document.createElement('option');
        option.value       = c._id;
        option.textContent = `${c.name} (${c.email})`;
        userSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Load customers error:', error);
  }
}

// =============================================
// Coupon Management
// =============================================
async function createCoupon(event) {
  event.preventDefault();

  const code         = document.getElementById('coupon-code').value.trim();
  const discountType  = document.getElementById('coupon-discount-type').value;
  const discountValue = parseFloat(document.getElementById('coupon-discount-value').value);
  const serviceType   = document.getElementById('coupon-service').value;
  const expiryDate    = document.getElementById('coupon-expiry').value;
  const description   = document.getElementById('coupon-description').value.trim();
  const userId        = document.getElementById('coupon-user').value;

  if (!code || !discountValue || !expiryDate) {
    showToast('Please fill in all required fields', 'warning');
    return;
  }

  const endpoint = userId
    ? `${API_BASE}/admin/coupons/send`
    : `${API_BASE}/admin/coupons`;

  try {
    const res  = await fetch(endpoint, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ code, discountType, discountValue, serviceType, expiryDate, description, userId: userId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast(data.message || 'Coupon created! 🎟', 'success');
    document.getElementById('coupon-form').reset();
  } catch (error) {
    showToast(error.message || 'Failed to create coupon', 'error');
  }
}

// =============================================
// Report Downloads
// =============================================
async function downloadReport(type) {
  showToast('Generating report...', 'info');

  try {
    const res = await fetch(`${API_BASE}/admin/export/${type}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Export failed');
    }

    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${type}_report.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showToast('Report downloaded! 📥', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to download report', 'error');
  }
}

// =============================================
// Logout
// =============================================
function adminLogout() {
  localStorage.removeItem('alka_token');
  localStorage.removeItem('alka_user');
  window.location.href = 'index.html';
}

// =============================================
// Toast (standalone for admin page)
// =============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
