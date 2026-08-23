/* ==========================================================================
   INTERACTION CONTROLLER — CONCEPT 4: 3D TACTILE COCKPIT CONSOLE
   ========================================================================== */

function switchSection(sectionId, btn) {
    document.querySelectorAll(".rail-btn").forEach(b => b.classList.remove("active"));
    if (btn) {
        btn.classList.add("active");
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    document.querySelectorAll(".drawer-section").forEach(sec => sec.style.display = "none");
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
        target.style.display = "flex";
        target.style.animation = "none";
        target.offsetHeight; // trigger reflow
        target.style.animation = "cockpitIgnite 0.22s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    setStatus(`Section: ${sectionId.toUpperCase()}`);
}

function filterCards() {
    const input = document.getElementById("symbolSearch");
    if (!input) return;
    const query = input.value.toLowerCase();
    const cards = document.querySelectorAll(".tactical-symbol-card");

    cards.forEach(card => {
        const name = (card.getAttribute("data-name") || "").toLowerCase();
        const cat = (card.getAttribute("data-category") || "").toLowerCase();
        const matches = name.includes(query) || cat.includes(query);
        card.style.display = matches ? "flex" : "none";
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

    const searchInput = document.getElementById("symbolSearch");
    if (searchInput && searchInput.value.trim() !== "") {
        filterCards();
    }
}

function selectSymbolCard(card, name, sidc) {
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

function sliderChange(id, value, unit) {
    const numEl = document.getElementById(`${id}Value`);
    if (numEl) numEl.textContent = `${value} ${unit}`;
    
    const slider = document.getElementById(`${id}Slider`);
    if (slider) {
        const min = Number(slider.min) || 0;
        const max = Number(slider.max) || 100;
        const pct = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(90deg, #00ff9d 0%, #a3e635 ${pct}%, rgba(0, 0, 0, 0.55) ${pct}%)`;
    }

    setStatus(`${id}: ${value} ${unit}`);
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

function toggleMaskSetting(button, id, onText, offText) {
    const isEnabled = button.dataset.enabled === "true";
    const nextState = !isEnabled;

    button.dataset.enabled = String(nextState);
    button.classList.toggle("active", nextState);

    const labelSpan = button.querySelector(".toggle-text");
    if (labelSpan) {
        labelSpan.textContent = nextState ? onText : offText;
    }

    showNotification(nextState ? onText : offText);
    setStatus(`${id}: ${nextState ? "ACTIVE" : "DISABLED"}`);
}

function initDockResizer() {
    const dock = document.querySelector(".tactical-menu-dock");
    if (!dock) return;

    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const MIN_WIDTH = 320;
    const MAX_WIDTH = 820;
    const MIN_HEIGHT = 290;

    function isResizeGrip(e) {
        const rect = dock.getBoundingClientRect();
        return (
            e.target.id === "dockResizeHandle" ||
            e.target.closest("#dockResizeHandle") ||
            (e.clientX >= rect.right - 24 && e.clientY >= rect.bottom - 24)
        );
    }

    dock.addEventListener("pointerdown", (e) => {
        if (!isResizeGrip(e)) return;

        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = dock.offsetWidth;
        startHeight = dock.offsetHeight;

        dock.classList.add("resizing");
        dock.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    const onPointerMove = (e) => {
        if (!isResizing) return;

        const maxH = window.innerHeight * 0.92;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (e.clientX - startX)));
        const newHeight = Math.min(maxH, Math.max(MIN_HEIGHT, startHeight + (e.clientY - startY)));

        dock.style.width = newWidth + "px";
        dock.style.height = newHeight + "px";
    };

    const stopResize = (e) => {
        if (isResizing) {
            isResizing = false;
            dock.classList.remove("resizing");
            try { dock.releasePointerCapture(e.pointerId); } catch (_) {}
            setStatus(`Resized: ${dock.offsetWidth}×${dock.offsetHeight}px`);
        }
    };

    dock.addEventListener("pointermove", onPointerMove);
    dock.addEventListener("pointerup", stopResize);
    dock.addEventListener("pointercancel", stopResize);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDockResizer);
} else {
    initDockResizer();
}

function selectOption(button, id, name) {
    const wasSelected = button.classList.contains("selected");
    const parent = button.closest(".drawer-section");
    
    if (parent) {
        parent.querySelectorAll(".tool-button.selected").forEach(btn => btn.classList.remove("selected"));
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

function performAction(id, name) {
    document.querySelectorAll(".tool-button.selected").forEach(btn => btn.classList.remove("selected"));
    showNotification(name);
    setStatus(`Executed: ${name}`);
}

let statusTimer, notifTimer;

function showNotification(name) {
    const notif = document.getElementById("toolNotification");
    const text = document.getElementById("notificationText");
    if (!notif || !text) return;
    text.textContent = name;
    notif.classList.add("show");
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => notif.classList.remove("show"), 1800);
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

window.switchSection = switchSection;
window.filterCards = filterCards;
window.filterCategory = filterCategory;
window.selectSymbolCard = selectSymbolCard;
window.selectOption = selectOption;
window.performAction = performAction;
window.sliderChange = sliderChange;
window.stepValue = stepValue;
window.toggleMaskSetting = toggleMaskSetting;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.setStatus = setStatus;