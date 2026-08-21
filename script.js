/* =====================================================
   TAB SWITCHING & SEARCH FILTERING
===================================================== */

function switchSection(sectionId, btn) {
    // 1. Update Rail Buttons
    document.querySelectorAll(".rail-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    // 2. Switch Contextual Drawer
    document.querySelectorAll(".drawer-section").forEach(sec => sec.style.display = "none");
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
        target.style.display = "flex";
    }

    setStatus(`Opened ${sectionId.toUpperCase()} panel`);
}

function filterCards() {
    const input = document.getElementById("symbolSearch");
    if (!input) return;
    const query = input.value.toLowerCase();
    const cards = document.querySelectorAll(".tactical-symbol-card");

    cards.forEach(card => {
        const name = (card.getAttribute("data-name") || "").toLowerCase();
        card.style.display = name.includes(query) ? "flex" : "none";
    });
}

function filterCategory(catId, pill) {
    document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    if (pill) pill.classList.add("active");

    const cards = document.querySelectorAll(".tactical-symbol-card");
    cards.forEach(card => {
        if (catId === "all" || card.getAttribute("data-category") === catId) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

function selectSymbolCard(card, name) {
    const wasActive = card.classList.contains("selected");
    document.querySelectorAll(".tactical-symbol-card").forEach(c => c.classList.remove("selected"));

    if (wasActive) {
        hideNotification();
        setStatus(`${name} deselected`);
        return;
    }

    card.classList.add("selected");
    showNotification(name);
    setStatus(`Armed: ${name}`);
}

/* =====================================================
   TERRAIN STATE & VALUES
===================================================== */
let radius = 1500;
let power = 2.0;
let maxHeight = 499;
let statusTimer, notificationTimer;

function selectOption(button, name) {
    const wasSelected = button.classList.contains("selected");
    const parent = button.closest(".drawer-section");
    
    if (parent) {
        parent.querySelectorAll(".tool-button.selected, .mode-button.selected")
              .forEach(btn => btn.classList.remove("selected"));
    }

    if (wasSelected) {
        hideNotification();
        setStatus(`${name} deselected`);
        return;
    }

    button.classList.add("selected");
    showNotification(name);
    setStatus(`${name} selected`);
}

function changeRadius(amount) {
    radius = Math.max(100, Math.min(10000, radius + amount));
    update("radiusValue", radius + " m");
    setStatus("Brush radius: " + radius + " m");
}

function changePower(amount) {
    power = Math.round((Math.max(0, Math.min(100, power + amount))) * 10) / 10;
    update("powerValue", power.toFixed(1) + " m");
    setStatus("Brush power: " + power.toFixed(1) + " m");
}

function changeMaxHeight(amount) {
    maxHeight = Math.max(0, Math.min(10000, maxHeight + amount));
    update("maxHeightValue", maxHeight + " m");
    setStatus("Maximum height: " + maxHeight + " m");
}

function changeInput(id, amount) {
    const input = document.getElementById(id);
    if (!input) return;
    input.value = Math.max(0, Number(input.value) + amount);
    setStatus(input.id + ": " + input.value);
}

function performAction(action) {
    document.querySelectorAll(".tool-button.selected, .mode-button.selected")
            .forEach(btn => btn.classList.remove("selected"));
    showNotification(action);
    setStatus(`Action: ${action}`);
}

function update(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* =====================================================
   NOTIFICATIONS & STATUS
===================================================== */
function showNotification(name) {
    const notif = document.getElementById("toolNotification");
    const text = document.getElementById("notificationText");
    if (!notif || !text) return;
    text.textContent = name;
    notif.classList.add("show");
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => notif.classList.remove("show"), 1500);
}

function hideNotification() {
    const notif = document.getElementById("toolNotification");
    if (notif) notif.classList.remove("show");
}

function setStatus(message) {
    const status = document.getElementById("statusText");
    if (!status) return;
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = "Terrain editor ready"; }, 2500);
}

// Attach globals for HTML handlers
window.switchSection = switchSection;
window.filterCards = filterCards;
window.filterCategory = filterCategory;
window.selectSymbolCard = selectSymbolCard;
window.selectOption = selectOption;
window.changeRadius = changeRadius;
window.changePower = changePower;
window.changeMaxHeight = changeMaxHeight;
window.changeInput = changeInput;
window.performAction = performAction;