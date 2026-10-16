const API_URL = "http://localhost:8080/api/issues";
const AUTH_URL = "http://localhost:8080/api/auth";

// Send requests with the login session cookie
async function apiFetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();

    const headers = new Headers(options.headers || {});

    // Get the CSRF token for requests that change data
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const csrfResponse = await fetch(`${AUTH_URL}/csrf`, {
            credentials: "include"
        });

        if (!csrfResponse.ok) {
            throw new Error("Unable to get security token. Please log in again.");
        }

        const csrfData = await csrfResponse.json();
        headers.set("X-XSRF-TOKEN", csrfData.token);
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Your session may have expired. Please log in again.");
    }

    return response;
}

// Get the HTML elements we need
const issuesTableBody = document.getElementById("issuesTableBody");
const totalCount = document.getElementById("totalCount");
const openCount = document.getElementById("openCount");
const resolvedCount = document.getElementById("resolvedCount");

const issueFormSection = document.getElementById("issueFormSection");
const issueForm = document.getElementById("issueForm");
const formTitle = document.getElementById("formTitle");
const issueIdInput = document.getElementById("issueId");

const messageBox = document.getElementById("message");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

let issues = [];

// Show a message to the user
function showMessage(message, isError = false) {
    messageBox.textContent = message;
    messageBox.classList.toggle("error", isError);
}

// Convert text to safe HTML so issue details cannot inject markup
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format the date from the backend
function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString();
}

// Retrieve all payment issues
async function loadIssues() {
    issuesTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">Loading records...</td>
        </tr>
    `;

    try {
        const response = await apiFetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to retrieve payment issues.");
        }

        issues = await response.json();

        renderDashboard();
        showMessage("");
    } catch (error) {
        issuesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Could not connect to PayTrack.
                    Make sure Spring Boot is running.
                </td>
            </tr>
        `;

        showMessage(error.message, true);
        totalCount.textContent = "—";
        openCount.textContent = "—";
        resolvedCount.textContent = "—";
    }
}

// Update the dashboard counts and issue table
function renderDashboard() {
    totalCount.textContent = issues.length;

    openCount.textContent = issues.filter(issue =>
        issue.status === "OPEN" ||
        issue.status === "IN_PROGRESS"
    ).length;

    resolvedCount.textContent = issues.filter(issue =>
        issue.status === "RESOLVED"
    ).length;

    renderIssuesTable();
}

// Apply search and filters before displaying the table
function renderIssuesTable() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredIssues = issues.filter(issue => {
        const matchesSearch =
            String(issue.transactionReference ?? "")
                .toLowerCase().includes(searchTerm) ||
            String(issue.merchantName ?? "")
                .toLowerCase().includes(searchTerm);

        const matchesStatus =
            !selectedStatus || issue.status === selectedStatus;

        const matchesPriority =
            !selectedPriority || issue.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (filteredIssues.length === 0) {
        issuesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No matching issues found.
                </td>
            </tr>
        `;
        return;
    }

    issuesTableBody.innerHTML = filteredIssues.map(issue => {
        const priorityClass = {
            HIGH: "priority-high",
            MEDIUM: "priority-medium",
            LOW: "priority-low"
        }[issue.priority] || "priority-low";

        const statusClass = {
            OPEN: "status-open",
            IN_PROGRESS: "status-in-progress",
            RESOLVED: "status-resolved"
        }[issue.status] || "status-open";

        const statusLabel = {
            OPEN: "Open",
            IN_PROGRESS: "In progress",
            RESOLVED: "Resolved"
        }[issue.status] || escapeHTML(issue.status);

        return `
            <tr>
                <td>
                    <span class="reference">
                        ${escapeHTML(issue.transactionReference)}
                    </span>
                    <span class="merchant">
                        ${escapeHTML(issue.merchantName)}
                    </span>
                </td>
                <td>${escapeHTML(issue.description)}</td>
                <td>
                    <span class="priority ${priorityClass}">
                        ${escapeHTML(issue.priority)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusLabel}
                    </span>
                </td>
                <td>${escapeHTML(formatDate(issue.createdAt))}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button"
                            data-action="edit"
                            data-id="${issue.id}">Edit</button>
                        <button type="button"
                            class="delete-button"
                            data-action="delete"
                            data-id="${issue.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Open a blank form to create a new issue
function openCreateForm() {
    issueForm.reset();
    issueIdInput.value = "";
    formTitle.textContent = "Log a new issue";
    issueFormSection.hidden = false;

    issueFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document.getElementById("transactionReference").focus();
}

// Open the form with existing issue details
function openEditForm(id) {
    const issue = issues.find(item => item.id === id);

    if (!issue) {
        showMessage("Issue could not be found.", true);
        return;
    }

    issueForm.reset();
    issueIdInput.value = issue.id;
    document.getElementById("transactionReference").value =
        issue.transactionReference ?? "";
    document.getElementById("merchantName").value =
        issue.merchantName ?? "";
    document.getElementById("description").value =
        issue.description ?? "";
    document.getElementById("priority").value =
        issue.priority ?? "MEDIUM";
    document.getElementById("status").value =
        issue.status ?? "OPEN";

    formTitle.textContent = "Edit payment issue";
    issueFormSection.hidden = false;

    issueFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Create a new issue or update an existing one
async function saveIssue(event) {
    event.preventDefault();

    const id = issueIdInput.value;

    const issueData = {
        transactionReference:
            document.getElementById("transactionReference").value.trim(),
        merchantName:
            document.getElementById("merchantName").value.trim(),
        description:
            document.getElementById("description").value.trim(),
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value
    };

    const saveButton = document.getElementById("saveBtn");
    saveButton.disabled = true;

    try {
        const response = await apiFetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(issueData)
            }
        );

        if (!response.ok) {
            let errorMessage = "Unable to save the issue.";

            try {
                const errors = await response.json();
                errorMessage = Object.values(errors).join(" ");
            } catch {
                // Keep the default message if no JSON error is returned.
            }

            throw new Error(errorMessage);
        }

        issueFormSection.hidden = true;
        issueForm.reset();

        await loadIssues();

        showMessage(id
            ? "Issue updated successfully."
            : "New issue recorded successfully."
        );
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
}

// Delete an issue after confirmation
async function deleteIssue(id) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this payment issue?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await apiFetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete the issue.");
        }

        await loadIssues();
        showMessage("Issue deleted successfully.");
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Connect the interface controls to their functions
document.getElementById("addIssueBtn")
    .addEventListener("click", openCreateForm);

document.getElementById("cancelBtn")
    .addEventListener("click", () => {
        issueFormSection.hidden = true;
        issueForm.reset();
        showMessage("");
    });

document.getElementById("refreshBtn")
    .addEventListener("click", loadIssues);

issueForm.addEventListener("submit", saveIssue);

searchInput.addEventListener("input", renderIssuesTable);
statusFilter.addEventListener("change", renderIssuesTable);
priorityFilter.addEventListener("change", renderIssuesTable);

// Handle Edit and Delete clicks inside the table
issuesTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);

    if (button.dataset.action === "edit") {
        openEditForm(id);
    } else if (button.dataset.action === "delete") {
        deleteIssue(id);
    }
});

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {
        try {
            // Uses your existing apiFetch function, which automatically handles
            // fetching the CSRF token and attaching the X-XSRF-TOKEN header.
            const logoutResponse = await apiFetch("http://localhost:8080/logout", {
                method: "POST"
            });

            if (!logoutResponse.ok) {
                throw new Error(`Unable to log out. Status: ${logoutResponse.status}`);
            }

            // Successfully logged out, redirect to login page
            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);
            if (typeof showMessage === "function") {
                showMessage(error.message, true);
            } else {
                alert(error.message);
            }
        }
    });

// Load existing issues when the page opens
loadIssues();
