/**
 * details.js - Mission Details Display Logic
 * Drone Delivery Mission Management System
 *
 * Responsibilities:
 * 1. Read mission data from sessionStorage
 * 2. Populate all fields on the page
 * 3. Determine if update is allowed (business rule check)
 * 4. Show appropriate alert and enable/disable update button
 */

'use strict';

// ─── Priority Badge Class Map ─────────────────────────────────
const PRIORITY_CLASS = {
  Low:      'priority-low',
  Medium:   'priority-medium',
  High:     'priority-high',
  Critical: 'priority-critical',
};

// ─── Status Badge Class Map ───────────────────────────────────
const STATUS_CLASS = {
  Pending:    'status-pending',
  Dispatched: 'status-dispatched',
  Delivered:  'status-delivered',
  Cancelled:  'status-cancelled',
};

// ─── Format Date ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Main Populate Function ───────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('missionData');

  if (!raw) {
    // No data → Show warning and hide details section
    document.getElementById('no-data-alert').style.display = 'flex';
    document.getElementById('mission-details-section').style.display = 'none';
    return;
  }

  const mission = JSON.parse(raw);

  // ── Populate Header ──
  document.getElementById('detail-mission-id').textContent = mission.missionId || '—';

  // Status badge
  const statusBadge = document.getElementById('detail-status-badge');
  statusBadge.textContent = mission.status || '—';
  statusBadge.className = `status-badge ${STATUS_CLASS[mission.status] || ''}`;

  // Priority badge
  const priorityBadge = document.getElementById('detail-priority-badge');
  priorityBadge.textContent = `🚨 ${mission.packagePriority || '—'}`;
  priorityBadge.className = `priority-badge ${PRIORITY_CLASS[mission.packagePriority] || ''}`;

  // ── Populate Non-Editable Fields ──
  document.getElementById('detail-mission-id-2').textContent   = mission.missionId       || '—';
  document.getElementById('detail-operator-id').textContent    = mission.operatorId      || '—';
  document.getElementById('detail-operator-name').textContent  = mission.operatorName    || '—';
  document.getElementById('detail-drone-model').textContent    = mission.droneModel      || '—';
  document.getElementById('detail-package-weight').textContent = mission.packageWeight
    ? `${mission.packageWeight} kg`
    : '—';
  document.getElementById('detail-assigned-date').textContent     = formatDate(mission.assignedDate);
  document.getElementById('detail-estimated-delivery').textContent = formatDate(mission.estimatedDelivery);
  document.getElementById('detail-pickup-loc').textContent     = mission.pickupLocation  || '—';
  document.getElementById('detail-drop-loc').textContent       = mission.dropLocation    || '—';

  // ── Populate Editable Fields ──
  document.getElementById('detail-delivery-window').textContent  = mission.deliveryWindow  || '—';
  document.getElementById('detail-package-priority').textContent = mission.packagePriority || '—';

  // ── Business Rule Check ──
  const alertEl   = document.getElementById('update-allowed-alert');
  const updateBtn = document.getElementById('btn-proceed-update');

  if (mission.status === 'Pending') {
    // Update IS allowed
    alertEl.className = 'alert alert-success';
    alertEl.classList.remove('hidden');
    document.getElementById('update-alert-icon').textContent = '✅';
    document.getElementById('update-alert-text').innerHTML =
      '<strong>Update Allowed:</strong> This mission is in <strong>Pending</strong> status. ' +
      'You can update the Delivery Window and Package Priority.';
    updateBtn.classList.remove('hidden');
  } else {
    // Update NOT allowed
    alertEl.className = 'alert alert-warning';
    alertEl.classList.remove('hidden');
    document.getElementById('update-alert-icon').textContent = '🚫';
    document.getElementById('update-alert-text').innerHTML =
      `<strong>Update Not Permitted:</strong> This mission status is <strong>"${mission.status}"</strong>. ` +
      `Only <strong>Pending</strong> missions can be updated.`;

    // Disable the update button
    updateBtn.textContent = '🚫 Update Not Allowed';
    updateBtn.style.opacity = '0.5';
    updateBtn.style.pointerEvents = 'none';
    updateBtn.style.cursor = 'not-allowed';
    updateBtn.removeAttribute('href');
  }
});
