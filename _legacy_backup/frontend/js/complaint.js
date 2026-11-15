/**
 * Alka Refrigeration — Complaint Module
 * Handles complaint form submission, geolocation, and user complaints display
 */

// =============================================
// Geolocation
// =============================================

/**
 * Auto-detect user's location using the Geolocation API
 * Then reverse geocode using Nominatim (free, no API key)
 */
// const API_BASE = "https://alka-backend.onrender.com/api";
function detectLocation() {
  const locationInput = document.getElementById('complaint-location');
  const detectBtn = document.getElementById('btn-detect-location');

  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  // Show loading state
  if (detectBtn) {
    detectBtn.innerHTML = '<span class="spinner"></span>';
    detectBtn.disabled = true;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // Reverse geocode using Nominatim (free service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();

        // Build readable address from response
        const address = data.address;
        let locationText = '';

        if (address) {
          const parts = [
            address.neighbourhood || address.suburb || address.hamlet || '',
            address.city || address.town || address.village || '',
            address.state_district || address.county || '',
            address.state || '',
            address.postcode || '',
          ].filter(Boolean);

          locationText = parts.join(', ');
        }

        if (!locationText && data.display_name) {
          locationText = data.display_name;
        }

        if (locationInput) {
          locationInput.value = locationText || `${latitude}, ${longitude}`;
        }

        showToast('Location detected successfully!', 'success');
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to coordinates
        if (locationInput) {
          locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
        showToast('Location detected (coordinates only)', 'info');
      }

      // Reset button
      if (detectBtn) {
        detectBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Detect`;
        detectBtn.disabled = false;
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      let msg = 'Unable to detect location.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          msg = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          msg = 'Location request timed out. Please try again.';
          break;
      }
      showToast(msg, 'error');

      // Reset button
      if (detectBtn) {
        detectBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Detect`;
        detectBtn.disabled = false;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

// =============================================
// Complaint Form Submission
// =============================================

/**
 * Handle complaint form submission
 */
async function submitComplaint(event) {
  event.preventDefault();

  // Check if user is logged in
  if (!isLoggedIn()) {
    showToast('Please login with Google to submit a complaint.', 'warning');
    triggerGoogleLogin();
    return;
  }

  const form = event.target;
  const submitBtn = form.querySelector('.btn-submit');

  // Gather form data
  const name = document.getElementById('complaint-name').value.trim();
  const mobile = document.getElementById('complaint-mobile').value.trim();
  const location = document.getElementById('complaint-location').value.trim();
  const serviceType = document.getElementById('complaint-service').value;
  const preferredDate = document.getElementById('complaint-date').value;
  const preferredTime = document.getElementById('complaint-time').value;
  const instructions = document.getElementById('complaint-instructions').value.trim();

  // Validate required fields
  if (!name) {
    showToast('Please enter your name.', 'error');
    document.getElementById('complaint-name').focus();
    return;
  }

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    showToast('Please enter a valid 10-digit mobile number.', 'error');
    document.getElementById('complaint-mobile').focus();
    return;
  }

  if (!location) {
    showToast('Please enter your location or click "Detect".', 'error');
    document.getElementById('complaint-location').focus();
    return;
  }

  if (!serviceType) {
    showToast('Please select a service type.', 'error');
    document.getElementById('complaint-service').focus();
    return;
  }

  if (!preferredDate) {
    showToast('Please select a preferred date.', 'error');
    document.getElementById('complaint-date').focus();
    return;
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(preferredDate) < today) {
    showToast('Preferred date cannot be in the past.', 'error');
    document.getElementById('complaint-date').focus();
    return;
  }

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/complaint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        mobile,
        location,
        serviceType,
        preferredDate,
        preferredTime,
        instructions,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit complaint');
    }

    showToast('🎉 Complaint registered successfully! We will contact you shortly.', 'success');

    // Reset form (keep name and mobile)
    document.getElementById('complaint-location').value = '';
    document.getElementById('complaint-service').value = '';
    document.getElementById('complaint-date').value = '';
    document.getElementById('complaint-time').value = 'Anytime';
    document.getElementById('complaint-instructions').value = '';

    // Update user's mobile in profile if changed
    if (mobile !== currentUser.mobile) {
      updateUserProfile(mobile, location);
    }

  } catch (error) {
    console.error('Submit complaint error:', error);
    showToast(error.message || 'Failed to submit complaint. Please try again.', 'error');
  }

  // Reset button
  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
}

/**
 * Update user's mobile/location in the backend
 */
async function updateUserProfile(mobile, location) {
  try {
    const response = await fetch(`${API_BASE}/auth/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mobile, location }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      localStorage.setItem('alka_user', JSON.stringify(currentUser));
    }
  } catch (error) {
    console.error('Profile update error:', error);
  }
}

// =============================================
// User Complaints Display
// =============================================

/**
 * Fetch and display the logged-in user's complaints
 */
async function loadUserComplaints() {
  if (!isLoggedIn()) {
    showToast('Please login to view your complaints.', 'warning');
    return;
  }

  const container = document.getElementById('complaints-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:40px;"><span class="spinner" style="border-color:rgba(26,35,126,0.2);border-top-color:#1a237e;width:32px;height:32px;"></span></div>';

  try {
    const response = await fetch(`${API_BASE}/complaint/user`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    if (!data.complaints || data.complaints.length === 0) {
      container.innerHTML = `
        <div class="no-complaints">
          <div class="icon">📋</div>
          <h3>No Complaints Yet</h3>
          <p>You haven't filed any service requests. Use the form above to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.complaints.map(c => {
      const date = new Date(c.preferredDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const statusClass = c.status.toLowerCase().replace(' ', '-');

      return `
        <div class="complaint-card">
          <div class="complaint-info">
            <h4>${c.serviceType}</h4>
            <div class="complaint-meta">
              <span>📍 ${c.location}</span>
              <span>📅 ${date}</span>
              <span>🕐 ${c.preferredTime}</span>
            </div>
            ${c.instructions ? `<p style="font-size:0.85rem;color:#636b83;margin-top:8px;">📝 ${c.instructions}</p>` : ''}
          </div>
          <span class="complaint-status ${statusClass}">${c.status}</span>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Load complaints error:', error);
    container.innerHTML = `
      <div class="no-complaints">
        <div class="icon">⚠️</div>
        <h3>Error Loading Complaints</h3>
        <p>${error.message || 'Something went wrong. Please try again.'}</p>
      </div>
    `;
  }
}

/**
 * Set the minimum date for the date picker to today
 */
function initDatePicker() {
  const dateInput = document.getElementById('complaint-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}
