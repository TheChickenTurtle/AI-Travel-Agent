// Utility functions for TravelMind AI

// DOM utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Event utilities
const on = (element, event, handler) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.addEventListener(event, handler);
  }
};

const off = (element, event, handler) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.removeEventListener(event, handler);
  }
};

// Class utilities
const addClass = (element, className) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.classList.add(className);
  }
};

const removeClass = (element, className) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.classList.remove(className);
  }
};

const toggleClass = (element, className) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.classList.toggle(className);
  }
};

const hasClass = (element, className) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  return element ? element.classList.contains(className) : false;
};

// Animation utilities
const fadeIn = (element, duration = 300) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.display = 'block';
  
  const start = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.opacity = progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

const fadeOut = (element, duration = 300) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (!element) return;
  
  const start = performance.now();
  const startOpacity = parseFloat(getComputedStyle(element).opacity);
  
  const animate = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.opacity = startOpacity * (1 - progress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.display = 'none';
    }
  };
  
  requestAnimationFrame(animate);
};

const slideUp = (element, duration = 300) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (!element) return;
  
  const height = element.offsetHeight;
  element.style.height = height + 'px';
  element.style.overflow = 'hidden';
  
  const start = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.height = height * (1 - progress) + 'px';
    element.style.opacity = 1 - progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      element.style.opacity = '';
    }
  };
  
  requestAnimationFrame(animate);
};

const slideDown = (element, duration = 300) => {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (!element) return;
  
  element.style.display = 'block';
  element.style.height = '0px';
  element.style.overflow = 'hidden';
  element.style.opacity = '0';
  
  const targetHeight = element.scrollHeight;
  const start = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.height = targetHeight * progress + 'px';
    element.style.opacity = progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.height = '';
      element.style.overflow = '';
      element.style.opacity = '';
    }
  };
  
  requestAnimationFrame(animate);
};

// Form utilities
const serializeForm = (form) => {
  if (typeof form === 'string') {
    form = $(form);
  }
  if (!form) return {};
  
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

// Storage utilities
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      return false;
    }
  }
};

// HTTP utilities
const http = {
  get: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  },
  
  post: async (url, data = {}, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  },
  
  put: async (url, data = {}, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  },
  
  delete: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
};

// Date utilities
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MMM DD, YYYY':
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[date.getMonth()]} ${day}, ${year}`;
    default:
      return date.toLocaleDateString();
  }
};

const formatTime = (date, format = '24h') => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

// Number utilities
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

// String utilities
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const truncate = (str, length = 100, suffix = '...') => {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Debounce utility
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Device detection
const device = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: () => /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768,
  isDesktop: () => !device.isMobile() && !device.isTablet(),
  getViewportSize: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })
};

// Notification utility
const notify = (message, type = 'info', duration = 3000) => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: '9999',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-out',
    maxWidth: '400px',
    wordWrap: 'break-word'
  });
  
  // Set background color based on type
  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
  
  // Click to dismiss
  notification.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
};

// Loading utility
const loading = {
  show: (element, text = 'Loading...') => {
    if (typeof element === 'string') {
      element = $(element);
    }
    if (!element) return;
    
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <div class="loading-text">${text}</div>
      </div>
    `;
    
    // Add styles
    Object.assign(loader.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000'
    });
    
    element.style.position = 'relative';
    element.appendChild(loader);
  },
  
  hide: (element) => {
    if (typeof element === 'string') {
      element = $(element);
    }
    if (!element) return;
    
    const loader = element.querySelector('.loading-overlay');
    if (loader) {
      loader.remove();
    }
  }
};

// Copy to clipboard utility
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Export utilities for use in other scripts
window.TravelMindUtils = {
  $, $$, on, off,
  addClass, removeClass, toggleClass, hasClass,
  fadeIn, fadeOut, slideUp, slideDown,
  serializeForm, validateEmail, validatePassword,
  storage, http,
  formatDate, formatTime, formatCurrency, formatNumber,
  capitalize, truncate, slugify,
  debounce, throttle,
  device, notify, loading, copyToClipboard
};