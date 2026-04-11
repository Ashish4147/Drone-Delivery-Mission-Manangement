/**
 * update.js - Update Mission Logic with Client-Side Validation
 * Drone Delivery Mission Management System
 *
 * Responsibilities:
 * 1. Load mission data from sessionStorage
 * 2. Populate read-only and editable fields
 * 3. Client-side validation of editable fields
 * 4. Business rule: Redirect to failure if status !== 'Pending'
 * 5. PUT API call to update mission
 * 6. Redirect to success.html or failure.html
 */

'use strict';

// ─── Status Badge Class Map ───────────────────────────────────
const STATUS_CLASS = {
  Pending:    'status-pending',
  Dispatched: 'status-dispatched',
  Delivered:  'status-delivered',
  Cancelled:  'status-cancelled',
};

// ─── Helper: Field Error Display ─────────────────────────────
function showFieldError(fieldId, errorId, msg) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(errorId);
  if (field) field.classList.add('error');
  if (err)   { err.textContent = msg; err.classList.add('show'); }
}

function clearFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(errorId);
  if (field) field.classList.remove('error');
  if (err)   { err.textContent = ''; err.classList.remove('show'); }
}

// ─── Client-Side Validation for Update Form ──────────────────
function validateUpdateForm(deliveryWindow, packagePriority) {
  let isValid = true;

  clearFieldError('deliveryWindow', 'window-error');
  clearFieldError('packagePriority', 'priority-error');
  document.getElementById('form-error-alert').classList.add('hidden');

  // At least one field must be filled
  if (!deliveryWindow && !packagePriority) {
    document.getElementById('form-error-message').textContent =
      'Please fill in at least one editable field (Delivery Window or Package Priority).';
    document.getElementById('form-error-alert').classList.remove('hidden');
    return false;
  }

  // Validate Delivery Window format if provided
  if (deliveryWindow) {
    const windowPattern = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
    if (!windowPattern.test(deliveryWindow.trim())) {
      showFieldError('deliveryWindow', 'window-error',
        'Invalid format. Use HH:MM - HH:MM (e.g., 09:00 - 11:00)');
      isValid = false;
    } else {
      // Validate time ranges
      const parts = deliveryWindow.split('-').map(s => s.trim());
      const [startH, startM] = parts[0].split(':').map(Number);
      const [endH, endM]     = parts[1].split(':').map(Number);
      if (startH > 23 || startM > 59 || endH > 23 || endM > 59) {
        showFieldError('deliveryWindow', 'window-error', 'Invalid time values. Hours must be 00-23, minutes 00-59.');
        isValid = false;
      } else if (startH * 60 + startM >= endH * 60 + endM) {
        showFieldError('deliveryWindow', 'window-error', 'Start time must be before end time.');
        isValid = false;
      }
    }
  }

  // Validate Package Priority if provided
  if (packagePriority) {
    const valid = ['Low', 'Medium', 'High', 'Critical'];
    if (!valid.includes(packagePriority)) {
      showFieldError('packagePriority', 'priority-error',
        'Invalid priority. Choose from: Low, Medium, High, Critical.');
      isValid = false;
    }
  }

  return isValid;
}

// ─── Load Data on Page Ready ──────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('missionData');

  if (!raw) {
    document.getElementById('no-data-alert').classList.remove('hidden');
    document.getElementById('update-form').style.display = 'none';
    document.getElementById('update-allowed-banner').style.display = 'none';
    return;
  }

  const mission = JSON.parse(raw);

  // ── Populate Hidden Fields ──
  document.getElementById('hidden-mission-id').value  = mission.missionId  || '';
  document.getElementById('hidden-operator-id').value = mission.operatorId || '';

  // ── Populate Header ──
  document.getElementById('update-mission-id').textContent = mission.missionId || '—';
  const statusBadge = document.getElementById('update-status-badge');
  statusBadge.textContent = mission.status || '—';
  statusBadge.className   = `status-badge ${STATUS_CLASS[mission.status] || ''}`;

  // ── Populate Read-Only Fields ──
  document.getElementById('ro-mission-id').value     = mission.missionId    || '';
  document.getElementById('ro-operator-id').value    = mission.operatorId   || '';
  document.getElementById('ro-operator-name').value  = mission.operatorName || '';
  document.getElementById('ro-drone-model').value    = mission.droneModel   || '';
  document.getElementById('ro-pkg-weight').value     = mission.packageWeight ? `${mission.packageWeight} kg` : '';
  document.getElementById('ro-status').value         = mission.status       || '';

  // ── Pre-fill Editable Fields with Current Values ──
  document.getElementById('deliveryWindow').value = mission.deliveryWindow   || '';
  document.getElementById('packagePriority').value = mission.packagePriority || '';

  // ── Business Rule Check (Client Side Pre-Check) ──
  if (mission.status !== 'Pending') {
    // Store failure data
    sessionStorage.setItem('failureResult', JSON.stringify({
      title:         'Update Not Permitted',
      message:       `This mission cannot be updated because its status is "${mission.status}". Only Pending missions can be updated.`,
      errorType:     'Business Rule Violation (403)',
      reason:        `Mission status is "${mission.status}". Updates are only allowed for Pending missions.`,
      missionId:     mission.missionId,
      currentStatus: mission.status,
      businessRule:  true,
    }));
    // Redirect immediately to failure page
    window.location.href = 'failure.html';
    return;
  }
});

// ─── Real-time Validation Feedback ───────────────────────────
document.getElementById('deliveryWindow').addEventListener('input', function () {
  clearFieldError('deliveryWindow', 'window-error');
});

document.getElementById('packagePriority').addEventListener('change', function () {
  clearFieldError('packagePriority', 'priority-error');
});

// ─── Form Submit ──────────────────────────────────────────────
document.getElementById('update-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const deliveryWindow   = document.getElementById('deliveryWindow').value.trim();
  const packagePriority  = document.getElementById('packagePriority').value.trim();
  const missionId        = document.getElementById('hidden-mission-id').value;
  const operatorId       = document.getElementById('hidden-operator-id').value;

  // ── Step 1: Client-Side Validation ──
  const isValid = validateUpdateForm(deliveryWindow, packagePriority);
  if (!isValid) return;

  // ── Step 2: Loading State ──
  const btn = document.getElementById('btn-update');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    // ── Step 3: PUT API Call ──
    const response = await fetch('/api/missions/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, operatorId, deliveryWindow, packagePriority }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // ── Server rejected the update → Failure ──
      sessionStorage.setItem('failureResult', JSON.stringify({
        title:         data.businessRule ? 'Update Not Permitted' : 'Update Failed',
        message:       data.message || 'The update could not be completed.',
        errorType:     data.businessRule
          ? 'Business Rule Violation (403)'
          : `Server Error (${response.status})`,
        reason:        data.message || 'Unknown error occurred.',
        missionId:     missionId,
        currentStatus: data.currentStatus || '—',
        businessRule:  data.businessRule || false,
      }));
      window.location.href = 'failure.html';
      return;
    }

    // ── Step 4: Update sessionStorage with latest data ──
    sessionStorage.setItem('missionData',   JSON.stringify(data.data));
    sessionStorage.setItem('updateResult',  JSON.stringify(data));

    // ── Step 5: Redirect to Success Page ──
    window.location.href = 'success.html';

  } catch (err) {
    console.error('Update Error:', err);
    sessionStorage.setItem('failureResult', JSON.stringify({
      title:        'Connection Error',
      message:      'Cannot connect to the server. Please ensure the backend is running.',
      errorType:    'Network Error',
      reason:       err.message || 'Server unreachable.',
      missionId:    missionId,
      currentStatus:'—',
      businessRule: false,
    }));
    window.location.href = 'failure.html';
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});
