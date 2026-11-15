/**
 * Alka Refrigeration — Auth Module
 * Handles Google OAuth login/logout flow
 * Manages JWT session and user profile UI
 */

// =============================================
// Configuration
// =============================================
// const API_BASE = 'https://alka-backend.onrender.com/api';
const API_BASE = window.API_BASE || 'https://alka-backend.onrender.com/api';

// =============================================
// State
// =============================================
let currentUser = null;
let authToken = null;

/**
 * Initialize authentication on page load
 * Checks for existing JWT token in localStorage
 */
function initAuth() {
  // Load saved token
  authToken = localStorage.getItem('alka_token');
  const savedUser = localStorage.getItem('alka_user');

  if (authToken && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateUIForLoggedIn();
      autoFillComplaintForm();
    } catch (e) {
      console.error('Error parsing saved user:', e);
      logout();
    }
  }
}

/**
 * Initialize Google Sign-In
 * Called after Google Identity Services script loads
 */
function initGoogleSignIn() {
  // Check if google identity services loaded
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google Identity Services not loaded');
    return;
  }

  google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID,
    callback: handleGoogleCallback,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

/**
 * Trigger Google Sign-In popup
 */
function triggerGoogleLogin() {
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('Google Sign-In is not configured yet. Please set up your Google Client ID.', 'warning');
    return;
  }

  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback: render a button or show error
      console.log('Google One Tap not displayed, reason:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
      
      // Try rendering a full sign-in button as fallback
      const tempDiv = document.createElement('div');
      tempDiv.id = 'google-signin-temp';
      tempDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:white;padding:40px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;font-size:18px;cursor:pointer;border:none;background:none;color:#666;';
      closeBtn.onclick = () => tempDiv.remove();
      
      const title = document.createElement('p');
      title.textContent = 'Sign in with Google';
      title.style.cssText = 'font-weight:600;margin-bottom:16px;text-align:center;font-size:1.1rem;';
      
      const btnContainer = document.createElement('div');
      btnContainer.id = 'google-btn-container';
      
      tempDiv.appendChild(closeBtn);
      tempDiv.appendChild(title);
      tempDiv.appendChild(btnContainer);
      document.body.appendChild(tempDiv);
      
      google.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with',
      });
    }
  });
}

/**
 * Handle Google Sign-In callback
 * Sends credential to backend for verification
 */
async function handleGoogleCallback(response) {
  try {
    // Remove temp sign-in dialog if exists
    const tempDiv = document.getElementById('google-signin-temp');
    if (tempDiv) tempDiv.remove();

    showToast('Signing you in...', 'info');

    const res = await fetch(`${API_BASE}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save to state and localStorage
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('alka_token', authToken);
    localStorage.setItem('alka_user', JSON.stringify(currentUser));

    // Update UI
    updateUIForLoggedIn();
    autoFillComplaintForm();
    showToast(`Welcome, ${currentUser.name}!`, 'success');

  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Login failed. Please try again.', 'error');
  }
}

/**
 * Update the navbar and form UI for logged-in state
 */
function updateUIForLoggedIn() {
  if (!currentUser) return;

  const loginBtn       = document.getElementById('btn-login');
  const profileDropdown = document.getElementById('profile-dropdown');
  const pmAdmin        = document.getElementById('pm-admin');

  if (loginBtn) loginBtn.style.display = 'none';
  if (profileDropdown) {
    profileDropdown.style.display = 'block';

    // Update avatars
    const navAvatar = document.getElementById('nav-avatar');
    const pmAvatar  = document.getElementById('pm-avatar');
    const avatarUrl = currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=FF6B00&color=fff`;
    if (navAvatar) navAvatar.src = avatarUrl;
    if (pmAvatar)  pmAvatar.src  = avatarUrl;

    // Show first name next to avatar in navbar trigger
    const firstName    = (currentUser.name || '').split(' ')[0];
    const navUserLabel = document.getElementById('nav-user-label');
    if (navUserLabel) navUserLabel.textContent = firstName;

    // Update user info in menu
    const pmName  = document.getElementById('pm-name');
    const pmEmail = document.getElementById('pm-email');
    if (pmName)  pmName.textContent  = currentUser.name;
    if (pmEmail) pmEmail.textContent = currentUser.email;
  }

  // Show admin link in dropdown if user is admin
  if (pmAdmin) {
    pmAdmin.style.display = (currentUser.role === 'admin') ? 'flex' : 'none';
  }
}

/**
 * Update the navbar and form UI for logged-out state
 */
function updateUIForLoggedOut() {
  const loginBtn = document.getElementById('btn-login');
  const profileDropdown = document.getElementById('profile-dropdown');

  if (loginBtn) loginBtn.style.display = 'inline-flex';
  if (profileDropdown) {
    profileDropdown.style.display = 'none';
    // Also close the menu if it was open
    const menu = document.getElementById('profile-menu');
    if (menu) menu.classList.remove('active');
  }
}

/**
 * Auto-fill complaint form with user data
 */
function autoFillComplaintForm() {
  if (!currentUser) return;

  const nameInput = document.getElementById('complaint-name');
  const mobileInput = document.getElementById('complaint-mobile');

  if (nameInput && currentUser.name) nameInput.value = currentUser.name;
  if (mobileInput && currentUser.mobile) mobileInput.value = currentUser.mobile;
}

/**
 * Logout — clear session and reset UI
 */
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('alka_token');
  localStorage.removeItem('alka_user');

  updateUIForLoggedOut();

  // Clear form fields
  const nameInput = document.getElementById('complaint-name');
  const mobileInput = document.getElementById('complaint-mobile');
  if (nameInput) nameInput.value = '';
  if (mobileInput) mobileInput.value = '';

  // Hide profile section
  const profileSection = document.getElementById('my-complaints');
  if (profileSection) profileSection.classList.remove('active');

  showToast('You have been logged out.', 'info');
}

/**
 * Get auth headers for API requests
 * Falls back to localStorage in case in-memory authToken is null (e.g. page reload on profile.html)
 */
function getAuthHeaders() {
  const token = authToken || localStorage.getItem('alka_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!authToken && !!currentUser;
}

/**
 * Check if user is admin
 */
function isAdmin() {
  return isLoggedIn() && currentUser.role === 'admin';
}
