/* =====================================================
   CESIUM EVENT DISPATCHER (TerrainAPI)
===================================================== */
window.TerrainAPI = {
    listeners: {},
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(...args));
        }
    }
};

/* =====================================================
   TAB & SEARCH LOGIC
===================================================== */
function switchSection(sectionId, btn) {
    document.querySelectorAll(".rail-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    document.querySelectorAll(".drawer-section").forEach(sec => sec.style.display = "none");
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.style.display = "flex";

    setStatus(`Opened ${sectionId.toUpperCase()}`);
    window.TerrainAPI.emit("sectionChanged", sectionId);
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

function selectSymbolCard(card, name, sidc) {
    const wasActive = card.classList.contains("selected");
    document.querySelectorAll(".tactical-symbol-card").forEach(c => c.classList.remove("selected"));

    if (wasActive) {
        hideNotification();
        setStatus(`${name} deselected`);
        window.TerrainAPI.emit("symbolDeselected", { name, sidc });
        return;
    }

    card.classList.add("selected");
    showNotification(name);
    setStatus(`Armed: ${name}`);
    window.TerrainAPI.emit("symbolSelected", { name, sidc });
}

/* =====================================================
   LIVE SLIDER & STEPPER VALUE HANDLERS
===================================================== */
function sliderChange(id, value, unit) {
    const numEl = document.getElementById(`${id}Value`);
    if (numEl) numEl.textContent = `${value} ${unit}`;
    
    setStatus(`${id}: ${value} ${unit}`);
    window.TerrainAPI.emit("valueChanged", id, Number(value));
}

function stepValue(id, delta, unit) {
    const slider = document.getElementById(`${id}Slider`);
    if (!slider) return;

    let newVal = Number(slider.value) + delta;
    newVal = Math.max(Number(slider.min), Math.min(Number(slider.max), newVal));
    newVal = Math.round(newVal * 10) / 10;

    slider.value = newVal;
    sliderChange(id, newVal, unit);
}

/* =====================================================
   BUTTON SELECTION & ACTIONS
===================================================== */
function selectOption(button, id, name) {
    const wasSelected = button.classList.contains("selected");
    const parent = button.closest(".drawer-section");
    
    if (parent) {
        parent.querySelectorAll(".tool-button.selected").forEach(btn => btn.classList.remove("selected"));
    }

    if (wasSelected) {
        hideNotification();
        setStatus(`${name} deselected`);
        window.TerrainAPI.emit("toolDeselected", id, name);
        return;
    }

    button.classList.add("selected");
    showNotification(name);
    setStatus(`${name} selected`);
    window.TerrainAPI.emit("toolSelected", id, name);
}

function performAction(id, name) {
    document.querySelectorAll(".tool-button.selected").forEach(btn => btn.classList.remove("selected"));
    showNotification(name);
    setStatus(`Action: ${name}`);
    window.TerrainAPI.emit("actionTriggered", id, name);
}

/* =====================================================
   STATUS & TOAST
===================================================== */
let statusTimer, notifTimer;

function showNotification(name) {
    const notif = document.getElementById("toolNotification");
    const text = document.getElementById("notificationText");
    if (!notif || !text) return;
    text.textContent = name;
    notif.classList.add("show");
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => notif.classList.remove("show"), 1500);
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

// Global window attachments
window.switchSection = switchSection;
window.filterCards = filterCards;
window.filterCategory = filterCategory;
window.selectSymbolCard = selectSymbolCard;
window.selectOption = selectOption;
window.performAction = performAction;
window.sliderChange = sliderChange;
window.stepValue = stepValue;