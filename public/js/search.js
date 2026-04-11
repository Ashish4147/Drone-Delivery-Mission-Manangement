/**
 * search.js - Client-Side Validation & Search Logic
 * Drone Delivery Mission Management System
 *
 * Responsibilities:
 * 1. Client-side input validation using JavaScript
 * 2. API call to fetch mission from server
 * 3. Store result in sessionStorage
 * 4. Redirect to details.html on success
 */

'use strict';

// ─── Helper: Show/Hide Field Error ────────────────────────────
function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
}

function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) {
    error.textContent = '';
    error.classList.remove('show');
  }
}

// ─── Client-Side Validation Function ─────────────────────────
function validateSearchForm(missionId, operatorId) {
  let isValid = true;

  // Clear previous errors
  clearFieldError('missionId', 'missionId-error');
  clearFieldError('operatorId', 'operatorId-error');
  document.getElementById('form-error-alert').classList.add('hidden');

  // Validate Mission ID
  if (!missionId || missionId.trim() === '') {
    showFieldError('missionId', 'missionId-error', 'Mission ID is required.');
    isValid = false;
  } else if (!/^MSN\d{3}$/i.test(missionId.trim())) {
    showFieldError('missionId', 'missionId-error', 'Invalid format. Mission ID must be like MSN001, MSN002, etc.');
    isValid = false;
  }

  // Validate Operator ID
  if (!operatorId || operatorId.trim() === '') {
    showFieldError('operatorId', 'operatorId-error', 'Operator ID is required.');
    isValid = false;
  } else if (!/^OPR\d{3}$/i.test(operatorId.trim())) {
    showFieldError('operatorId', 'operatorId-error', 'Invalid format. Operator ID must be like OPR101, OPR102, etc.');
    isValid = false;
  }

  return isValid;
}

// ─── Real-time Input Formatting ──────────────────────────────
document.getElementById('missionId').addEventListener('input', function () {
  this.value = this.value.toUpperCase();
  clearFieldError('missionId', 'missionId-error');
});

document.getElementById('operatorId').addEventListener('input', function () {
  this.value = this.value.toUpperCase();
  clearFieldError('operatorId', 'operatorId-error');
});

// ─── Quick Fill Buttons ───────────────────────────────────────
document.querySelectorAll('.quick-fill').forEach((btn) => {
  btn.addEventListener('click', function () {
    document.getElementById('missionId').value  = this.dataset.mission;
    document.getElementById('operatorId').value = this.dataset.operator;
    clearFieldError('missionId', 'missionId-error');
    clearFieldError('operatorId', 'operatorId-error');
    document.getElementById('form-error-alert').classList.add('hidden');
  });
});

// ─── Form Submit Handler ──────────────────────────────────────
document.getElementById('search-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const missionId  = document.getElementById('missionId').value.trim().toUpperCase();
  const operatorId = document.getElementById('operatorId').value.trim().toUpperCase();

  // ── Step 1: Client-Side Validation ──
  const isValid = validateSearchForm(missionId, operatorId);
  if (!isValid) return;

  // ── Step 2: Show Loading State ──
  const btn = document.getElementById('btn-search');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    // ── Step 3: API Call to Server ──
    const response = await fetch(
      `/api/missions/search?missionId=${encodeURIComponent(missionId)}&operatorId=${encodeURIComponent(operatorId)}`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      // Server-side validation failed → Show error
      const errMsg = data.message || 'Mission not found. Please check the IDs and try again.';
      document.getElementById('form-error-message').textContent = errMsg;
      document.getElementById('form-error-alert').classList.remove('hidden');

      // Store failure data and redirect to failure page
      sessionStorage.setItem('failureResult', JSON.stringify({
        title: 'Mission Not Found',
        message: errMsg,
        errorType: response.status === 404 ? 'Record Not Found (404)' : `Server Error (${response.status})`,
        reason: errMsg,
        missionId: missionId,
        currentStatus: '—',
        businessRule: false,
      }));

      // For 404, redirect to failure page
      if (response.status === 404) {
        setTimeout(() => { window.location.href = 'failure.html'; }, 1500);
      }
      return;
    }

    // ── Step 4: Store in sessionStorage (Client Integration) ──
    sessionStorage.setItem('missionData', JSON.stringify(data.data));
    sessionStorage.removeItem('failureResult');

    // ── Step 5: Redirect to Details Page ──
    window.location.href = 'details.html';

  } catch (err) {
    // Network/connection error
    const errMsg = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
    document.getElementById('form-error-message').textContent = errMsg;
    document.getElementById('form-error-alert').classList.remove('hidden');
    console.error('Search Error:', err);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});
