/**
 * Alka Refrigeration — Main App Module
 * Handles navigation, animations, coupons, gallery, toasts, and feedback form
 */

// =============================================
// DOM Ready
// =============================================
// const API_BASE = "https://alka-backend.onrender.com/api";
window.API_BASE = 'https://alka-backend.onrender.com/api';
window.GOOGLE_CLIENT_ID = '406359171230-p0nrsk1e8kqqskclntpvpvn4bqt083pe.apps.googleusercontent.com';
let googleRetryCount = 0;

function initGoogleProperly() {
  if (!window.google || !google.accounts) {
    googleRetryCount++;

    if (googleRetryCount > 10) {
      console.error("❌ Google SDK failed to load");
      return;
    }

    console.log("⏳ Waiting for Google...");
    setTimeout(initGoogleProperly, 500);
    return;
  }

  google.accounts.id.initialize({
    client_id: '406359171230-p0nrsk1e8kqqskclntpvpvn4bqt083pe.apps.googleusercontent.com',
    callback: handleGoogleCallback,
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  console.log("✅ Google initialized properly");
}
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initGoogleProperly(); 
  initNavbar();
  initScrollAnimations();
  initGalleryLightbox();
  initDatePicker();
  loadCoupons();
  setMinDate();
});

// =============================================
// Navbar
// =============================================

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');

  // Scroll effect — add shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active nav link
    updateActiveNavLink();
  });

  // Mobile toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Close mobile menu on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu on link click
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}
}

/**
 * Update active nav link based on scroll position
 */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// =============================================
// Scroll Animations (Intersection Observer)
// =============================================

function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeElements.forEach(el => el.classList.add('visible'));
  }
}

// =============================================
// Gallery Lightbox
// =============================================

function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =============================================
// Coupons / Special Offers
// =============================================

async function loadCoupons() {
  const grid = document.getElementById('offers-grid');
  if (!grid) return;

  try {
    const response = await fetch(`${API_BASE}/coupons`);
    const data = await response.json();

    if (!response.ok || !data.coupons || data.coupons.length === 0) {
      grid.innerHTML = `
        <div class="no-offers">
          <p>🎁 No special offers at the moment. Check back soon!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = data.coupons.map(coupon => {
      const expiry = new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      return `
        <div class="offer-card fade-in">
          <div class="discount">${coupon.discount}<span>% OFF</span></div>
          <h4>${coupon.serviceType}</h4>
          <p>${coupon.description || 'Use this coupon to avail discount on your next service!'}</p>
          <div class="offer-code">${coupon.code}</div>
          <span class="offer-expiry">Valid till ${expiry}</span>
        </div>
      `;
    }).join('');

    // Re-observe new fade-in elements
    initScrollAnimations();

  } catch (error) {
    console.error('Load coupons error:', error);
    grid.innerHTML = `
      <div class="no-offers">
        <p>🎁 Special offers coming soon! Stay tuned.</p>
      </div>
    `;
  }
}

// =============================================
// Feedback Form
// =============================================

function submitFeedback(event) {
  event.preventDefault();

  const name = document.getElementById('feedback-name').value.trim();
  const email = document.getElementById('feedback-email').value.trim();
  const message = document.getElementById('feedback-message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all feedback fields.', 'warning');
    return;
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // In production, this would send to an API endpoint
  // For MVP, show a success message
  showToast('Thank you for your feedback! We appreciate it. 🙏', 'success');

  // Reset form
  document.getElementById('feedback-name').value = '';
  document.getElementById('feedback-email').value = '';
  document.getElementById('feedback-message').value = '';
}

// =============================================
// Profile / My Complaints Section
// =============================================

function showProfile() {
  if (!isLoggedIn()) {
    showToast('Please login to view your profile.', 'warning');
    triggerGoogleLogin();
    return;
  }

  const section = document.getElementById('my-complaints');
  if (section) {
    section.classList.add('active');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadUserComplaints();
  }
}

// =============================================
// Toast Notification System
// =============================================

function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// =============================================
// Utility — Set min date on date input
// =============================================

function setMinDate() {
  const dateInput = document.getElementById('complaint-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
}

// =============================================
// Profile Dropdown & Bottom Nav
// =============================================

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// Close profile menu if clicked outside
document.addEventListener('click', (e) => {
  const trigger = document.getElementById('profile-trigger');
  const menu = document.getElementById('profile-menu');
  if (menu && menu.classList.contains('active')) {
    if (!trigger.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('active');
    }
  }
});

// Set active state for bottom nav based on current path/hash
function initBottomNav() {
  const items = document.querySelectorAll('.bottom-nav-item');
  if (!items.length) return;

  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  
  items.forEach(item => {
    item.classList.remove('active');
    
    const tab = item.getAttribute('data-tab');
    
    if (tab === 'home' && currentPath.includes('index.html')) {
      item.classList.add('active');
    } else if (tab === 'bookings' && currentPath.includes('profile.html') && currentSearch.includes('complaints')) {
      item.classList.add('active');
    } else if (tab === 'profile' && currentPath.includes('profile.html') && !currentSearch.includes('complaints')) {
      item.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBottomNav();
});
