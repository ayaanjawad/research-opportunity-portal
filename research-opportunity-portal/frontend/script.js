const API_BASE = "/api/opportunities";

const grid             = document.getElementById("opportunitiesGrid");
const emptyState       = document.getElementById("emptyState");
const searchInput      = document.getElementById("searchInput");
const filterStatus     = document.getElementById("filterStatus");
const filterDept       = document.getElementById("filterDept");
const addBtn           = document.getElementById("addBtn");
const headerStats      = document.getElementById("headerStats");
const modalOverlay     = document.getElementById("modalOverlay");
const modalTitle       = document.getElementById("modalTitle");
const modalClose       = document.getElementById("modalClose");
const form             = document.getElementById("opportunityForm");
const editIdInput      = document.getElementById("editId");
const submitBtn        = document.getElementById("submitBtn");
const cancelBtn        = document.getElementById("cancelBtn");
const deleteOverlay    = document.getElementById("deleteOverlay");
const deleteCancelBtn  = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
const toast            = document.getElementById("toast");
const formErrors       = document.getElementById("formErrors");
const viewOverlay      = document.getElementById("viewOverlay");
const viewModalClose   = document.getElementById("viewModalClose");
const viewModalBody    = document.getElementById("viewModalBody");

// Welcome screen elements
const welcomeView        = document.getElementById("welcomeView");
const portalView         = document.getElementById("portalView");
const enterPortalBtn     = document.getElementById("enterPortalBtn");
const skipToPortalBtn    = document.getElementById("skipToPortalBtn");
const welcomeNewBtn      = document.getElementById("welcomeNewBtn");
const backToWelcomeBtn   = document.getElementById("backToWelcomeBtn");
const portalLogo         = document.getElementById("portalLogo");
const autoLoadCard       = document.getElementById("autoLoadCard");
const countdownText      = document.getElementById("countdownText");
const cancelAutoLoadBtn  = document.getElementById("cancelAutoLoadBtn");

let allOpportunities = [];
let deleteTargetId   = null;
let countdownRemaining = 3;
let autoLoadTimer = null;
let isAutoLoadPaused = false;


async function fetchOpportunities() {
    try {
        const res  = await fetch(API_BASE);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        allOpportunities = data;
        applyFilters();
        updateStats();
        updateDeptFilter();
    } catch (err) {
        showToast(err.message, "error");
    }
}


function updateStats() {
    const total = allOpportunities.length;
    const open  = allOpportunities.filter(o => o.status === "Open").length;
    headerStats.innerHTML = `
        <span class="stat-pill"><span class="stat-dot stat-dot--total"></span> ${total} Total</span>
        <span class="stat-pill"><span class="stat-dot stat-dot--open"></span> ${open} Open</span>
    `;
}


function updateDeptFilter() {
    const current = filterDept.value;
    const depts = [...new Set(allOpportunities.map(o => o.department))].sort();

    filterDept.innerHTML = '<option value="all">All Departments</option>';
    depts.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        filterDept.appendChild(opt);
    });

    if (depts.includes(current)) {
        filterDept.value = current;
    }
}


function applyFilters() {
    const q      = searchInput.value.toLowerCase();
    const status = filterStatus.value;
    const dept   = filterDept.value;

    const filtered = allOpportunities.filter(opp => {
        const matchesSearch = opp.title.toLowerCase().includes(q) ||
                              opp.research_area.toLowerCase().includes(q) ||
                              opp.faculty_name.toLowerCase().includes(q) ||
                              opp.department.toLowerCase().includes(q);
        const matchesStatus = status === "all" || opp.status === status;
        const matchesDept   = dept === "all"   || opp.department === dept;
        return matchesSearch && matchesStatus && matchesDept;
    });

    renderCards(filtered);
}


function renderCards(items) {
    grid.innerHTML = "";

    if (items.length === 0) {
        grid.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    items.forEach((opp, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${i * 50}ms`;

        const statusClass = opp.status === "Open" ? "badge--open" : "badge--closed";
        const isOpen = opp.status === "Open";

        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${esc(opp.title)}</span>
                <span class="badge ${statusClass}">
                    <span class="badge-dot"></span>
                    ${esc(opp.status)}
                </span>
            </div>
            <p class="card-desc">${esc(opp.description)}</p>
            <div class="card-meta">
                <span class="meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${esc(opp.faculty_name)}
                </span>
                <span class="meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    ${esc(opp.department)}
                </span>
                <span class="meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    ${esc(opp.research_area)}
                </span>
                <span class="meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    ${opp.available_positions} Available
                </span>
                <span class="meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${opp.deadline}
                </span>
            </div>
            <p class="card-skills"><strong>Skills:</strong> ${esc(opp.required_skills)}</p>
            <div class="card-actions">
                <button class="btn btn-accent-ghost btn-sm" onclick="viewDetails(${opp.id})">View</button>
                <button class="btn btn-ghost btn-sm" onclick="openEdit(${opp.id})">Edit</button>
                ${isOpen ? `<button class="btn btn-warning btn-sm" onclick="closeOpportunity(${opp.id})">Close</button>` : ""}
                <button class="btn btn-danger btn-sm" onclick="confirmDelete(${opp.id})">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}


async function viewDetails(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const opp = await res.json();
        if (!res.ok) throw new Error(opp.error || "Not found");

        const statusClass = opp.status === "Open" ? "badge--open" : "badge--closed";

        viewModalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-row detail-row--full">
                    <span class="detail-label">Title</span>
                    <span class="detail-value detail-value--title">${esc(opp.title)}</span>
                </div>
                <div class="detail-row detail-row--full">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${esc(opp.description)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Research Area</span>
                    <span class="detail-value">${esc(opp.research_area)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department</span>
                    <span class="detail-value">${esc(opp.department)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Faculty</span>
                    <span class="detail-value">${esc(opp.faculty_name)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Required Skills</span>
                    <span class="detail-value">${esc(opp.required_skills)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Available Positions</span>
                    <span class="detail-value">${opp.available_positions}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Deadline</span>
                    <span class="detail-value">${opp.deadline}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value"><span class="badge ${statusClass}"><span class="badge-dot"></span> ${esc(opp.status)}</span></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ID</span>
                    <span class="detail-value">#${opp.id}</span>
                </div>
            </div>
        `;

        viewOverlay.classList.remove("hidden");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function closeViewModal() {
    viewOverlay.classList.add("hidden");
}

viewModalClose.addEventListener("click", closeViewModal);
viewOverlay.addEventListener("click", (e) => {
    if (e.target === viewOverlay) closeViewModal();
});


async function closeOpportunity(id) {
    const opp = allOpportunities.find(o => o.id === id);
    if (!opp) return;

    const payload = {
        title:               opp.title,
        description:         opp.description,
        research_area:       opp.research_area,
        faculty_name:        opp.faculty_name,
        department:          opp.department,
        required_skills:     opp.required_skills,
        available_positions: opp.available_positions,
        deadline:            opp.deadline,
        status:              "Closed"
    };

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to close");

        showToast("Opportunity closed successfully.", "success");
        fetchOpportunities();
    } catch (err) {
        showToast(err.message, "error");
    }
}


function validateForm() {
    const errors = [];

    const fields = [
        { id: "title",               label: "Title" },
        { id: "description",         label: "Description" },
        { id: "research_area",       label: "Research Area" },
        { id: "faculty_name",        label: "Faculty Name" },
        { id: "department",          label: "Department" },
        { id: "required_skills",     label: "Required Skills" },
        { id: "available_positions", label: "Available Positions" },
        { id: "deadline",            label: "Deadline" }
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        el.classList.remove("input-error");
    });

    fields.forEach(f => {
        const el  = document.getElementById(f.id);
        const val = el.value.trim();
        if (!val) {
            errors.push(`${f.label} is required.`);
            el.classList.add("input-error");
        }
    });

    const posVal = document.getElementById("available_positions").value;
    if (posVal && parseInt(posVal, 10) < 1) {
        errors.push("Available Positions must be at least 1.");
        document.getElementById("available_positions").classList.add("input-error");
    }

    const deadlineVal = document.getElementById("deadline").value;
    if (deadlineVal) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadlineVal + "T00:00:00");
        if (deadlineDate < today) {
            errors.push("Deadline cannot be in the past.");
            document.getElementById("deadline").classList.add("input-error");
        }
    }

    if (errors.length > 0) {
        formErrors.innerHTML = errors.map(e => `<p>• ${e}</p>`).join("");
        formErrors.classList.remove("hidden");
        return false;
    }

    formErrors.classList.add("hidden");
    return true;
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
        title:               document.getElementById("title").value.trim(),
        description:         document.getElementById("description").value.trim(),
        research_area:       document.getElementById("research_area").value.trim(),
        faculty_name:        document.getElementById("faculty_name").value.trim(),
        department:          document.getElementById("department").value,
        required_skills:     document.getElementById("required_skills").value.trim(),
        available_positions: parseInt(document.getElementById("available_positions").value, 10),
        deadline:            document.getElementById("deadline").value,
        status:              document.getElementById("status").value
    };

    const editId = editIdInput.value;
    const isEdit = !!editId;

    try {
        const res = await fetch(
            isEdit ? `${API_BASE}/${editId}` : API_BASE,
            {
                method:  isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload)
            }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");

        closeModal();
        showToast(data.message, "success");
        fetchOpportunities();
    } catch (err) {
        showToast(err.message, "error");
    }
});


async function openEdit(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const opp = await res.json();
        if (!res.ok) throw new Error(opp.error || "Not found");

        editIdInput.value = id;
        document.getElementById("title").value               = opp.title;
        document.getElementById("description").value         = opp.description;
        document.getElementById("research_area").value       = opp.research_area;
        document.getElementById("faculty_name").value        = opp.faculty_name;
        document.getElementById("department").value          = opp.department;
        document.getElementById("required_skills").value     = opp.required_skills;
        document.getElementById("available_positions").value = opp.available_positions;
        document.getElementById("deadline").value            = opp.deadline;
        document.getElementById("status").value              = opp.status;

        modalTitle.textContent = "Edit Opportunity";
        submitBtn.textContent  = "Update";
        formErrors.classList.add("hidden");
        modalOverlay.classList.remove("hidden");
    } catch (err) {
        showToast(err.message, "error");
    }
}


function confirmDelete(id) {
    deleteTargetId = id;
    deleteOverlay.classList.remove("hidden");
}

deleteConfirmBtn.addEventListener("click", async () => {
    if (!deleteTargetId) return;
    try {
        const res  = await fetch(`${API_BASE}/${deleteTargetId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");

        deleteOverlay.classList.add("hidden");
        deleteTargetId = null;
        showToast(data.message, "success");
        fetchOpportunities();
    } catch (err) {
        showToast(err.message, "error");
    }
});

deleteCancelBtn.addEventListener("click", () => {
    deleteOverlay.classList.add("hidden");
    deleteTargetId = null;
});


searchInput.addEventListener("input", applyFilters);
filterStatus.addEventListener("change", applyFilters);
filterDept.addEventListener("change", applyFilters);


addBtn.addEventListener("click", () => {
    form.reset();
    editIdInput.value = "";
    modalTitle.textContent = "New Opportunity";
    submitBtn.textContent  = "Create";
    formErrors.classList.add("hidden");
    modalOverlay.classList.remove("hidden");
});

function closeModal() {
    modalOverlay.classList.add("hidden");
    form.reset();
    editIdInput.value = "";
    formErrors.classList.add("hidden");
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

modalClose.addEventListener("click", closeModal);
cancelBtn.addEventListener("click",  closeModal);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});


let toastTimer;
function showToast(msg, type = "success") {
    toast.textContent = msg;
    toast.className   = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 3500);
}


function esc(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}


/* ── Welcome Page Navigation ─────────────────────────── */
function startAutoLoadTimer() {
    if (autoLoadTimer) clearInterval(autoLoadTimer);
    countdownRemaining = 3;
    if (countdownText) countdownText.textContent = `${countdownRemaining}s`;

    autoLoadTimer = setInterval(() => {
        if (isAutoLoadPaused) return;
        countdownRemaining -= 1;
        if (countdownText) countdownText.textContent = `${countdownRemaining}s`;
        if (countdownRemaining <= 0) {
            clearInterval(autoLoadTimer);
            showPortal(false);
        }
    }, 1000);
}

function pauseAutoLoad() {
    isAutoLoadPaused = true;
    if (autoLoadTimer) clearInterval(autoLoadTimer);
    if (autoLoadCard) {
        autoLoadCard.classList.add("paused");
        autoLoadCard.innerHTML = `<span class="auto-load-info">Countdown paused. Click <strong>Enter Portal</strong> when ready.</span>`;
    }
}

function showPortal(openCreate = false) {
    if (autoLoadTimer) clearInterval(autoLoadTimer);
    if (welcomeView) welcomeView.classList.add("hidden");
    if (portalView) portalView.classList.remove("hidden");
    window.location.hash = "portal";
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (openCreate && addBtn) {
        addBtn.click();
    }
}

function showWelcome() {
    if (portalView) portalView.classList.add("hidden");
    if (welcomeView) welcomeView.classList.remove("hidden");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

if (enterPortalBtn)    enterPortalBtn.addEventListener("click", () => showPortal(false));
if (skipToPortalBtn)   skipToPortalBtn.addEventListener("click", () => showPortal(false));
if (welcomeNewBtn)     welcomeNewBtn.addEventListener("click", () => showPortal(true));
if (backToWelcomeBtn)  backToWelcomeBtn.addEventListener("click", showWelcome);
if (portalLogo)        portalLogo.addEventListener("click", showWelcome);
if (cancelAutoLoadBtn) cancelAutoLoadBtn.addEventListener("click", pauseAutoLoad);

// Handle direct hash navigation
if (window.location.hash === "#portal") {
    showPortal(false);
} else {
    startAutoLoadTimer();
}

fetchOpportunities();
