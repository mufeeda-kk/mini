/**
 * Kudumbashree Digital Management System - Interactive Javascript
 * Handles Dark Mode Toggling, Client-Side Table Searching/Sorting/Filtering, & Forms Validation
 */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Dark Mode Controller
    const darkToggle = document.getElementById("dark-mode-toggle");
    const bodyElement = document.body;

    if (darkToggle) {
        // Load stored preference
        const isDark = localStorage.getItem("dark-theme-enabled") === "true";
        darkToggle.checked = isDark;
        if (isDark) {
            bodyElement.classList.add("dark-theme");
        } else {
            bodyElement.classList.remove("dark-theme");
        }

        // Toggle action
        darkToggle.addEventListener("change", function () {
            if (darkToggle.checked) {
                bodyElement.classList.add("dark-theme");
                localStorage.setItem("dark-theme-enabled", "true");
            } else {
                bodyElement.classList.remove("dark-theme");
                localStorage.setItem("dark-theme-enabled", "false");
            }
        });
    }

    // 2. Sidebar Collapsing & Mobile Toggling
    const toggleBtn = document.getElementById("sidebar-toggle");
    const mobileToggleBtn = document.getElementById("sidebar-mobile-toggle");
    const appWrapper = document.querySelector(".app-wrapper");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            appWrapper.classList.toggle("collapsed");
            localStorage.setItem("sidebar-collapsed", appWrapper.classList.contains("collapsed"));
        });
    }

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", function () {
            appWrapper.classList.toggle("mobile-open");
        });
    }

    // Close sidebar on background click for mobile
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
        mainContent.addEventListener("click", function () {
            if (appWrapper && appWrapper.classList.contains("mobile-open")) {
                appWrapper.classList.remove("mobile-open");
            }
        });
    }

    // Restore sidebar state
    if (localStorage.getItem("sidebar-collapsed") === "true" && appWrapper) {
        appWrapper.classList.add("collapsed");
    }

    // 3. Automated Alert Dismissals
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function(alert) {
            let bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        });
    }, 5000);

    // 4. Client-Side Table Search / Filter Utility
    const tableSearchInputs = document.querySelectorAll(".table-search-input");
    tableSearchInputs.forEach(input => {
        input.addEventListener("input", function () {
            const filter = input.value.toLowerCase().trim();
            const targetTableId = input.getAttribute("data-target-table");
            const table = document.getElementById(targetTableId);
            if (!table) return;

            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(row => {
                if (row.classList.contains("empty-row")) return;
                const text = row.textContent.toLowerCase();
                if (text.includes(filter)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });

    // 5. Client-Side Table Sorting Utility
    const sortableHeaders = document.querySelectorAll("th.sortable-header");
    sortableHeaders.forEach(header => {
        header.addEventListener("click", function () {
            const table = header.closest("table");
            const tbody = table.querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);
            const isAscending = header.classList.contains("sort-asc");
            
            // Clear current classes
            header.parentNode.querySelectorAll("th").forEach(th => {
                th.classList.remove("sort-asc", "sort-desc");
            });

            rows.sort((a, b) => {
                const cellA = a.children[columnIndex].textContent.trim().toLowerCase();
                const cellB = b.children[columnIndex].textContent.trim().toLowerCase();
                
                // Numeric comparison helper
                const numA = parseFloat(cellA.replace(/[^\d.-]/g, ''));
                const numB = parseFloat(cellB.replace(/[^\d.-]/g, ''));

                if (!isNaN(numA) && !isNaN(numB)) {
                    return isAscending ? numB - numA : numA - numB;
                }
                return isAscending ? cellB.localeCompare(cellA) : cellA.localeCompare(cellB);
            });

            // Set new sort class
            if (isAscending) {
                header.classList.add("sort-desc");
            } else {
                header.classList.add("sort-asc");
            }

            // Append sorted rows
            tbody.append(...rows);
        });
    });

    // 6. Chat form handler (Mock dynamic replies)
    const chatForm = document.getElementById("chat-submit-form");
    const chatInput = document.getElementById("chat-message-input");
    const chatMessageBoxes = document.getElementById("chat-messages-box");

    if (chatForm && chatInput && chatMessageBoxes) {
        chatMessageBoxes.scrollTop = chatMessageBoxes.scrollHeight;

        chatForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;

            const formData = new FormData(chatForm);
            fetch(chatForm.action, {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    const bubble = `
                        <div class="d-flex flex-column chat-bubble sent">
                            <small class="fw-bold mb-1 text-white-50">You</small>
                            <div>${escapeHtml(msg)}</div>
                            <small class="text-end mt-1 text-white-50" style="font-size: 0.7rem;">Just now</small>
                        </div>
                    `;
                    chatMessageBoxes.insertAdjacentHTML("beforeend", bubble);
                    chatInput.value = "";
                    chatMessageBoxes.scrollTop = chatMessageBoxes.scrollHeight;
                }
            });
        });
    }

    // 6.5. AJAX Workflow Action Handlers
    const chatContainer = document.getElementById("chat-messages-box");
    if (chatContainer) {
        // Event delegation for Approve/Reject buttons
        chatContainer.addEventListener("click", function(e) {
            const btn = e.target.closest(".workflow-action-btn");
            if (!btn) return;
            
            e.preventDefault();
            const actionContainer = btn.closest(".action-buttons");
            if (!actionContainer) return;
            
            const type = actionContainer.getAttribute("data-type");
            const itemId = actionContainer.getAttribute("data-item-id");
            const action = btn.getAttribute("data-action"); // "approve" or "reject"
            
            let url = "";
            if (type === "loan") {
                url = `/loans/action/${itemId}/${action}/?format=json`;
            } else if (type === "scheme") {
                url = `/schemes/action/${itemId}/${action}/?format=json`;
            } else if (type === "member") {
                url = `/dashboard/verify/${itemId}/${action}/?format=json`;
            }
            
            if (!url) return;
            
            btn.disabled = true;
            fetch(url, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCsrfToken()
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    // Update status badge inside the card
                    const card = btn.closest(".workflow-card");
                    if (card) {
                        const badgeContainer = card.querySelector(".status-badge-container");
                        if (badgeContainer) {
                            let badgeClass = "bg-success";
                            let statusText = action.charAt(0).toUpperCase() + action.slice(1) + "d";
                            if (action === "reject") {
                                badgeClass = "bg-danger";
                            }
                            badgeContainer.innerHTML = `<span class="badge ${badgeClass} rounded-pill">${statusText}</span>`;
                        }
                    }
                    // Hide action buttons
                    actionContainer.remove();
                    
                    // Update sidebar item if it exists
                    const sidebarItem = document.getElementById(`sidebar-${type}-${itemId}`);
                    if (sidebarItem) {
                        sidebarItem.remove();
                        // Decrement count badge in sidebar
                        const badgeCount = document.getElementById(`badge-count-${type}s`);
                        if (badgeCount) {
                            let count = parseInt(badgeCount.innerText) - 1;
                            badgeCount.innerText = count >= 0 ? count : 0;
                            if (count <= 0) {
                                const list = document.getElementById(`sidebar-${type}s-list`);
                                if (list) {
                                    list.innerHTML = `<div class="text-center py-2 text-muted small bg-white rounded border border-dashed py-3">No active requests</div>`;
                                }
                            }
                        }
                    }
                } else {
                    btn.disabled = false;
                    alert("Error: " + (data.message || "Action failed."));
                }
            })
            .catch(err => {
                btn.disabled = false;
                console.error("Workflow AJAX error:", err);
            });
        });

        // Event delegation for Complaint Resolution Forms
        chatContainer.addEventListener("submit", function(e) {
            const form = e.target.closest(".complaint-resolve-form-inline");
            if (!form) return;
            
            e.preventDefault();
            const actionContainer = form.closest(".action-buttons");
            if (!actionContainer) return;
            
            const itemId = actionContainer.getAttribute("data-item-id");
            const formData = new FormData(form);
            
            fetch(`/complaints/resolve-ajax/${itemId}/`, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCsrfToken()
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    // Update status badge
                    const card = form.closest(".workflow-card");
                    if (card) {
                        const badgeContainer = card.querySelector(".status-badge-container");
                        if (badgeContainer) {
                            badgeContainer.innerHTML = `<span class="badge bg-success rounded-pill">Resolved</span>`;
                        }
                        
                        // Show resolution text block
                        const body = card.querySelector(".card-body");
                        if (body) {
                            const resDiv = document.createElement("div");
                            resDiv.className = "mt-2 small bg-light p-2 rounded border-start border-3 border-success text-muted";
                            resDiv.style.fontSize = "0.78rem";
                            resDiv.innerHTML = `<strong><i class="fas fa-info-circle text-success me-1"></i>Resolution Response:</strong> <span class="resolution-text">${escapeHtml(data.reply_text)}</span>`;
                            body.appendChild(resDiv);
                        }
                    }
                    // Remove form
                    actionContainer.remove();
                    
                    // Remove from sidebar
                    const sidebarItem = document.getElementById(`sidebar-complaint-${itemId}`);
                    if (sidebarItem) {
                        sidebarItem.remove();
                        // Decrement count
                        const badgeCount = document.getElementById("badge-count-complaints");
                        if (badgeCount) {
                            let count = parseInt(badgeCount.innerText) - 1;
                            badgeCount.innerText = count >= 0 ? count : 0;
                            if (count <= 0) {
                                const list = document.getElementById("sidebar-complaints-list");
                                if (list) {
                                    list.innerHTML = `<div class="text-center py-2 text-muted small bg-white rounded border border-dashed py-3">No active grievances</div>`;
                                }
                            }
                        }
                    }
                } else {
                    alert("Error: " + (data.message || "Failed to resolve complaint."));
                }
            })
            .catch(err => {
                console.error("Complaint resolution AJAX error:", err);
            });
        });
    }

    // Helper to get CSRF token
    function getCsrfToken() {
        const tokenInput = document.querySelector("[name=csrfmiddlewaretoken]");
        return tokenInput ? tokenInput.value : "";
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

// 7. Chart.js Config Helpers
window.KudumbashreeCharts = {
    renderBarChart: function (canvasId, labels, data, labelText, primaryColor = '#9C278F') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: labelText,
                    data: data,
                    backgroundColor: primaryColor,
                    borderRadius: 8,
                    maxBarThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderPieChart: function (canvasId, labels, data, colors) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors || ['#9C278F', '#6CB33F', '#FB8C00', '#E53935', '#2196F3'],
                    borderWidth: 2,
                    borderColor: 'transparent'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, color: '#94A3B8' } }
                },
                cutout: '65%'
            }
        });
    }
};
