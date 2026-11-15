/**
 * Alka Refrigeration — Customer Profile JS
 * Handles:
 * - User info display & editing
 * - Complaint listing with status timeline
 * - Customer edit/cancel booking (with isConfirmed guard)
 * - Razorpay payment with coupon application
 * - Coupon display
 */

// =============================================
// Configuration
// =============================================
const PROFILE_API_BASE = window.API_BASE || 'https://alka-backend.onrender.com/api';
let profileUser  = null;
let userCoupons  = [];
let allUserComplaints = [];

// WhatsApp number for "Need Help?"
const WHATSAPP_NUMBER = '918090546021';

// =============================================
// Initialization
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  checkProfileAuth();
});

function checkProfileAuth() {
  const savedUser = localStorage.getItem('alka_user');
  const token     = localStorage.getItem('alka_token');

  if (!token || !savedUser) {
    showToast('Please login to view your profile.', 'warning');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  try {
    profileUser = JSON.parse(savedUser);
  } catch (e) {
    showToast('Session error. Please login again.', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  // ── Navbar profile dropdown ──────────────────────────────────────────────
  const profileDropdown = document.getElementById('profile-dropdown');
  if (profileDropdown) {
    profileDropdown.style.display = 'block';
    const navAvatar = document.getElementById('nav-avatar');
    const pmAvatar  = document.getElementById('pm-avatar');
    const pmName    = document.getElementById('pm-name');
    const pmEmail   = document.getElementById('pm-email');
    const pmAdmin   = document.getElementById('pm-admin');

    const avatarUrl = profileUser.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=FF6B00&color=fff`;

    if (navAvatar) navAvatar.src = avatarUrl;
    if (pmAvatar)  pmAvatar.src  = avatarUrl;
    if (pmName)    pmName.textContent  = profileUser.name;
    if (pmEmail)   pmEmail.textContent = profileUser.email;
    if (pmAdmin)   pmAdmin.style.display = (profileUser.role === 'admin') ? 'flex' : 'none';
  }

  // ── Navbar: show first name + icon ───────────────────────────────────────
  const firstName = (profileUser.name || '').split(' ')[0];
  const navUserLabel = document.getElementById('nav-user-label');
  if (navUserLabel) navUserLabel.textContent = firstName;

  // ── Profile header ───────────────────────────────────────────────────────
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName   = document.getElementById('profile-name');
  const profileEmail  = document.getElementById('profile-email');
  if (profileAvatar) profileAvatar.src = profileUser.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=FF6B00&color=fff`;
  if (profileName)  profileName.textContent  = profileUser.name;
  if (profileEmail) profileEmail.textContent = profileUser.email;

  // ── Info tab ──────────────────────────────────────────────────────────────
  document.getElementById('info-name').value     = profileUser.name     || '';
  document.getElementById('info-email').value    = profileUser.email    || '';
  document.getElementById('info-mobile').value   = profileUser.mobile   || '';
  document.getElementById('info-location').value = profileUser.location || '';

  // ── URL tab switch ────────────────────────────────────────────────────────
  const urlParams     = new URLSearchParams(window.location.search);
  const requestedTab  = urlParams.get('tab');
  if (requestedTab) switchTab(requestedTab);

  loadUserComplaints();
  loadUserCoupons();
}

function getAuthHeaders() {
  const token = localStorage.getItem('alka_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// =============================================
// Tab Navigation
// =============================================
window.switchTab = function (tabName) {
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) btn.classList.add('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');

  if (tabName === 'complaints') loadUserComplaints();
  if (tabName === 'coupons')    loadUserCoupons();
};

// =============================================
// Profile Update
// =============================================
async function updateProfile(event) {
  event.preventDefault();
  const mobile   = document.getElementById('info-mobile').value.trim();
  const location = document.getElementById('info-location').value.trim();

  try {
    const res  = await fetch(`${PROFILE_API_BASE}/auth/update-profile`, {
      method:  'PUT',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ mobile, location }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    profileUser = data.user;
    localStorage.setItem('alka_user', JSON.stringify(profileUser));
    showToast('Profile updated successfully! ✅', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to update profile', 'error');
  }
}

// =============================================
// User Complaints — Load
// =============================================
async function loadUserComplaints() {
  const container = document.getElementById('complaints-container');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-loading">
      <span class="spinner"></span>
      <p>Loading your complaints...</p>
    </div>
  `;

  try {
    const res  = await fetch(`${PROFILE_API_BASE}/complaint/user`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    allUserComplaints = data.complaints || [];

    if (allUserComplaints.length === 0) {
      container.innerHTML = `
        <div class="profile-empty">
          <div class="empty-icon">📋</div>
          <h3>No Complaints Yet</h3>
          <p>You haven't submitted any service requests. <a href="index.html#home" style="color:#ff6f00;font-weight:600;">Book a service</a> to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allUserComplaints.map(c => renderComplaintCard(c)).join('');
  } catch (error) {
    console.error('Load complaints error:', error);
    container.innerHTML = `
      <div class="profile-empty">
        <div class="empty-icon">⚠️</div>
        <h3>Error Loading Complaints</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// =============================================
// Complaint Card Renderer
// =============================================
function renderComplaintCard(c) {
  const date = c.preferredDate
    ? new Date(c.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const statusClass = `pcc-badge-${c.status.toLowerCase().replace(/ /g, '-')}`;

  // Status timeline
  const statuses     = ['Pending', 'Called', 'Confirmed', 'On The Way', 'Completed'];
  const currentIndex = statuses.indexOf(c.status);
  const isCancelled  = c.status === 'Cancelled';
  const icons        = ['📝', '📞', '✅', '🚗', '🏆'];

  const timeline = statuses.map((s, i) => {
    let stepClass = 'upcoming';
    if (!isCancelled) {
      if (i < currentIndex)      stepClass = 'done';
      else if (i === currentIndex) stepClass = 'active';
    }
    return `
      <div class="timeline-step ${stepClass}">
        <div class="timeline-dot">${icons[i]}</div>
        <div class="timeline-label">${s}</div>
      </div>
    `;
  }).join('');

  // Cancellation notice
  let cancelNotice = '';
  if (isCancelled) {
    const by = c.cancelledBy === 'Admin' ? 'Cancelled by Alka Refrigeration' : 'Cancelled by you';
    const reason = c.cancelReason ? ` — ${c.cancelReason}` : '';
    cancelNotice = `
      <div class="pcc-cancel-notice">
        <span class="cancel-badge">❌ ${by}${reason}</span>
      </div>
    `;
  }

  // Payment section
  const hasAmount = c.amount > 0;
  const isPaid    = c.paymentStatus === 'Paid';

  let paymentHtml = '';
  if (hasAmount) {
    paymentHtml = `
      <div class="pcc-payment">
        <div class="payment-info">
          <div class="payment-label">${isPaid ? 'Amount Paid' : 'Pending Amount'}</div>
          <div class="payment-amount ${isPaid ? 'payment-paid' : ''}">₹${c.amount}</div>
        </div>
        ${isPaid
          ? `<button class="btn-pay-online btn-pay-disabled" disabled>✅ Paid</button>`
          : `<button class="btn-pay-online" onclick="openPaymentModal('${c._id}', ${c.amount}, '${c.serviceType}')">💳 Pay Online</button>`
        }
      </div>
    `;
  } else {
    paymentHtml = `
      <div class="pcc-payment">
        <div class="payment-info">
          <div class="payment-label">Amount</div>
          <div class="payment-amount">₹0</div>
        </div>
        <span style="font-size:0.82rem;color:#8890a7;">Amount will be set after technician visit</span>
      </div>
    `;
  }

  // ── Edit / Cancel / Need Help? actions ───────────────────────────────────
  let actionHtml = '';
  if (!isCancelled && c.status !== 'Completed') {
    if (!c.isConfirmed) {
      // Not yet confirmed — allow edit & cancel
      actionHtml = `
        <div class="pcc-actions">
          <button class="btn-pcc-edit" onclick="openEditModal('${c._id}')">✏️ Edit Booking</button>
          <button class="btn-pcc-cancel" onclick="openCancelConfirm('${c._id}')">🗑 Cancel Booking</button>
        </div>
      `;
    } else {
      // Confirmed — lock edit/cancel, show Need Help?
      const waMsg = encodeURIComponent(
        `Hi, I want to cancel/edit my booking (ID: ${c._id}) because `
      );
      actionHtml = `
        <div class="pcc-actions pcc-actions-confirmed">
          <div class="confirmed-lock-msg">
            🔒 Booking confirmed, cannot cancel online
          </div>
          <a class="btn-pcc-whatsapp"
             href="https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}"
             target="_blank" rel="noopener">
            💬 Need Help?
          </a>
        </div>
      `;
    }
  }

  return `
    <div class="profile-complaint-card">
      <div class="pcc-header">
        <span class="pcc-service">${c.serviceType}</span>
        <span class="pcc-badge ${statusClass}">${c.status}</span>
      </div>

      <div class="status-timeline">${timeline}</div>

      ${cancelNotice}

      <div class="pcc-details">
        <div class="pcc-detail">
          <div class="label">Location</div>
          <div class="value">${c.location}</div>
        </div>
        <div class="pcc-detail">
          <div class="label">Date & Time</div>
          <div class="value">${date} • ${c.preferredTime}</div>
        </div>
        <div class="pcc-detail">
          <div class="label">Mobile</div>
          <div class="value">${c.mobile}</div>
        </div>
        <div class="pcc-detail">
          <div class="label">Instructions</div>
          <div class="value">${c.instructions || 'None'}</div>
        </div>
      </div>

      ${paymentHtml}
      ${actionHtml}
    </div>
  `;
}

// =============================================
// Edit Booking Modal
// =============================================
let editComplaintId = null;

function openEditModal(complaintId) {
  editComplaintId = complaintId;
  const complaint = allUserComplaints.find(c => c._id === complaintId);
  if (!complaint) return;

  // Pre-fill fields
  document.getElementById('edit-mobile').value   = complaint.mobile        || '';
  document.getElementById('edit-location').value = complaint.location      || '';
  document.getElementById('edit-time').value     = complaint.preferredTime || 'Anytime';
  document.getElementById('edit-instructions').value = complaint.instructions || '';

  // preferredDate — format to YYYY-MM-DD
  if (complaint.preferredDate) {
    const d = new Date(complaint.preferredDate);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    document.getElementById('edit-date').value = `${yyyy}-${mm}-${dd}`;
  }

  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  editComplaintId = null;
}

async function submitEditBooking() {
  if (!editComplaintId) return;

  const mobile        = document.getElementById('edit-mobile').value.trim();
  const location      = document.getElementById('edit-location').value.trim();
  const preferredDate = document.getElementById('edit-date').value;
  const preferredTime = document.getElementById('edit-time').value;
  const instructions  = document.getElementById('edit-instructions').value.trim();

  if (!mobile || !location || !preferredDate) {
    showToast('Please fill in mobile, location, and date.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-save-edit');
  btn.disabled    = true;
  btn.textContent = 'Saving...';

  try {
    const res  = await fetch(`${PROFILE_API_BASE}/complaint/${editComplaintId}/update`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ mobile, location, preferredDate, preferredTime, instructions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Booking updated successfully! ✅', 'success');
    closeEditModal();
    loadUserComplaints();
  } catch (error) {
    showToast(error.message || 'Failed to update booking', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Save Changes';
  }
}

// =============================================
// Cancel Booking Confirm
// =============================================
let cancelTargetId = null;

function openCancelConfirm(complaintId) {
  cancelTargetId = complaintId;
  document.getElementById('cancel-confirm-modal').style.display = 'flex';
}

function closeCancelConfirm() {
  document.getElementById('cancel-confirm-modal').style.display = 'none';
  cancelTargetId = null;
}

async function confirmCancelBooking() {
  if (!cancelTargetId) return;

  const btn = document.getElementById('btn-confirm-cancel');
  btn.disabled    = true;
  btn.textContent = 'Cancelling...';

  try {
    const res  = await fetch(`${PROFILE_API_BASE}/complaint/${cancelTargetId}/cancel`, {
      method:  'PATCH',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ reason: 'Cancelled by customer' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Booking cancelled.', 'info');
    closeCancelConfirm();
    loadUserComplaints();
  } catch (error) {
    showToast(error.message || 'Failed to cancel booking', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Yes, Cancel';
  }
}

// =============================================
// User Coupons
// =============================================
async function loadUserCoupons() {
  const container = document.getElementById('coupons-container');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-loading">
      <span class="spinner"></span>
      <p>Loading your coupons...</p>
    </div>
  `;

  try {
    const res  = await fetch(`${PROFILE_API_BASE}/coupons/my-coupons`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    userCoupons = data.coupons || [];

    if (userCoupons.length === 0) {
      container.innerHTML = `
        <div class="profile-empty">
          <div class="empty-icon">🎟</div>
          <h3>No Coupons Available</h3>
          <p>You don't have any active coupons right now. Check back later!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="coupons-grid">${userCoupons.map(renderCouponCard).join('')}</div>`;
  } catch (error) {
    console.error('Load coupons error:', error);
    container.innerHTML = `
      <div class="profile-empty">
        <div class="empty-icon">⚠️</div>
        <h3>Error Loading Coupons</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderCouponCard(coupon) {
  const expiry        = new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const discountType  = coupon.discountType  || 'Percentage';
  const discountValue = coupon.discountValue || coupon.discount;
  const discountDisplay = discountType === 'Percentage'
    ? `${discountValue}<span>% OFF</span>`
    : `₹${discountValue}<span> OFF</span>`;

  return `
    <div class="coupon-card">
      <div class="coupon-discount">${discountDisplay}</div>
      <h4>${coupon.serviceType || 'All Services'}</h4>
      <div class="coupon-code-display">${coupon.code}</div>
      <p style="font-size:0.82rem;color:#636b83;margin:4px 0;">${coupon.description || 'Apply this coupon during payment!'}</p>
      <div class="coupon-meta">Valid till ${expiry}</div>
    </div>
  `;
}

// =============================================
// Payment Modal & Processing (Razorpay)
// =============================================
let paymentComplaintId   = '';
let paymentOriginalAmount = 0;
let paymentServiceType   = '';

function openPaymentModal(complaintId, amount, serviceType) {
  paymentComplaintId    = complaintId;
  paymentOriginalAmount = amount;
  paymentServiceType    = serviceType;

  document.getElementById('payment-complaint-id').value          = complaintId;
  document.getElementById('payment-amount').value                = amount;
  document.getElementById('payment-original-amount').textContent = `₹${amount}`;
  document.getElementById('payment-final-amount').textContent    = `₹${amount}`;
  document.getElementById('payment-discount-row').style.display  = 'none';

  // Populate coupon dropdown
  const couponSelect = document.getElementById('payment-coupon');
  couponSelect.innerHTML = '<option value="">No coupon</option>';
  userCoupons.forEach(coupon => {
    if (coupon.serviceType !== 'All Services' && coupon.serviceType !== serviceType) return;
    const discountType  = coupon.discountType  || 'Percentage';
    const discountValue = coupon.discountValue || coupon.discount;
    const label = discountType === 'Percentage'
      ? `${coupon.code} — ${discountValue}% OFF`
      : `${coupon.code} — ₹${discountValue} OFF`;
    const option = document.createElement('option');
    option.value                  = coupon._id;
    option.textContent            = label;
    option.dataset.discountType   = discountType;
    option.dataset.discountValue  = discountValue;
    couponSelect.appendChild(option);
  });

  document.getElementById('payment-modal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
}

function recalculatePayment() {
  const select      = document.getElementById('payment-coupon');
  const selected    = select.options[select.selectedIndex];
  const discountRow = document.getElementById('payment-discount-row');
  const discountEl  = document.getElementById('payment-discount');
  const finalEl     = document.getElementById('payment-final-amount');

  if (!selected.value) {
    discountRow.style.display = 'none';
    finalEl.textContent       = `₹${paymentOriginalAmount}`;
    return;
  }

  const discountType  = selected.dataset.discountType;
  const discountValue = parseFloat(selected.dataset.discountValue);
  let discountAmount  = discountType === 'Percentage'
    ? (paymentOriginalAmount * discountValue) / 100
    : discountValue;

  discountAmount = Math.min(discountAmount, paymentOriginalAmount);
  const finalAmount = Math.max(paymentOriginalAmount - discountAmount, 0);

  discountRow.style.display = 'flex';
  discountEl.textContent    = `-₹${Math.round(discountAmount)}`;
  finalEl.textContent       = `₹${Math.round(finalAmount)}`;
}

// Razorpay payment flow
async function processPayment() {
  const complaintId = document.getElementById('payment-complaint-id').value;
  const couponId    = document.getElementById('payment-coupon').value || undefined;

  const payBtn = document.querySelector('.btn-pay');
  payBtn.disabled    = true;
  payBtn.textContent = 'Processing...';

  try {
    // Step 1: Create Razorpay order on backend
    const orderRes  = await fetch(`${PROFILE_API_BASE}/payment/create-order`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ complaintId, couponId }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message);

    // Step 2: If Razorpay keys not configured, fall back to simulate
    if (!orderData.keyId || orderData.keyId.includes('XXXXX')) {
      await fallbackSimulatePayment(complaintId, couponId);
      return;
    }

    // Step 3: Open Razorpay checkout
    const options = {
      key:         orderData.keyId,
      amount:      Math.round(orderData.amount * 100),
      currency:    'INR',
      name:        'Alka Refrigeration',
      description: `Service Payment`,
      order_id:    orderData.orderId,
      prefill: {
        name:    orderData.userName,
        email:   orderData.userEmail,
        contact: orderData.userMobile,
      },
      theme: { color: '#FF6B00' },
      handler: async function (response) {
        // Step 4: Verify on backend
        const verifyRes = await fetch(`${PROFILE_API_BASE}/payment/verify`, {
          method:  'POST',
          headers: getAuthHeaders(),
          body:    JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            complaintId,
            couponId,
            finalAmount:         orderData.amount,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.message);

        showToast('🎉 Payment successful! Thank you.', 'success');
        closePaymentModal();
        loadUserComplaints();
        loadUserCoupons();
      },
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled.', 'info');
          payBtn.disabled    = false;
          payBtn.textContent = '✅ Confirm Payment';
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast(`Payment failed: ${response.error.description}`, 'error');
      payBtn.disabled    = false;
      payBtn.textContent = '✅ Confirm Payment';
    });
    rzp.open();

  } catch (error) {
    showToast(error.message || 'Payment failed. Please try again.', 'error');
    payBtn.disabled    = false;
    payBtn.textContent = '✅ Confirm Payment';
  }
}

// Fallback: simulate payment if Razorpay keys not yet configured
async function fallbackSimulatePayment(complaintId, couponId) {
  try {
    const res  = await fetch(`${PROFILE_API_BASE}/complaint/${complaintId}/pay`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ couponId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('🎉 Payment successful! Thank you.', 'success');
    closePaymentModal();
    loadUserComplaints();
    loadUserCoupons();
  } catch (error) {
    showToast(error.message || 'Payment failed.', 'error');
  } finally {
    const payBtn = document.querySelector('.btn-pay');
    if (payBtn) {
      payBtn.disabled    = false;
      payBtn.textContent = '✅ Confirm Payment';
    }
  }
}

// =============================================
// Logout
// =============================================
function profileLogout() {
  localStorage.removeItem('alka_token');
  localStorage.removeItem('alka_user');
  window.location.href = 'index.html';
}

// =============================================
// Toast (standalone for profile page)
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
  }, 5000);
}
