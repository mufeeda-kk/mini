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
                    
                    // Simple simulated reply after 2 seconds
                    setTimeout(() => {
                        const reply = `
                            <div class="d-flex flex-column chat-bubble received">
                                <small class="fw-bold mb-1 text-primary-purple">Anitha (Member)</small>
                                <div>Got it. Roster checklists and reports look correct.</div>
                                <small class="text-end mt-1 text-muted" style="font-size: 0.7rem;">Just now</small>
                            </div>
                        `;
                        chatMessageBoxes.insertAdjacentHTML("beforeend", reply);
                        chatMessageBoxes.scrollTop = chatMessageBoxes.scrollHeight;
                    }, 2000);
                }
            });
        });
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
