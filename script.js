import ms from "milsymbol";

/* =====================================================
   MILITARY SYMBOLS
===================================================== */

function openSymbolPicker(event, categoryLabel) {
    event.stopPropagation();

    const picker = document.getElementById("symbolPicker");
    const title = document.getElementById("symbolPickerTitle");
    const grid = document.getElementById("symbolPickerGrid");

    if (!picker || !title || !grid) {
        console.error("Symbol picker elements not found");
        return;
    }

    title.textContent = categoryLabel.toUpperCase();
    grid.innerHTML = "";

    // 1. JSON data se us category ke symbols dhoondhein
    // (Maan kar chal rahe hain ki aapne fetched data ko global variable `appData` ya `toolData` mein rakha hai)
    let variants = [];
    if (window.terrainToolData && window.terrainToolData.sections) {
        const symbolSection = window.terrainToolData.sections.find(sec => sec.id === "symbols");
        if (symbolSection) {
            const foundCategory = symbolSection.items.find(item => item.label === categoryLabel);
            if (foundCategory && foundCategory.symbols) {
                variants = foundCategory.symbols;
            }
        }
    }

    variants.forEach(variant => {
        const button = document.createElement("button");
        button.className = "symbol-subtype";

        const svg = createMilSymbol(variant.sidc, 35);

        button.innerHTML = `
            <span class="symbol-subtype-icon">${svg}</span>
            <span class="symbol-subtype-name">${variant.name}</span>
        `;

        button.onclick = function (e) {
            e.stopPropagation();
            const alreadySelected = button.classList.contains("selected");

            document.querySelectorAll(".symbol-subtype").forEach(btn => {
                btn.classList.remove("selected");
            });

            if (alreadySelected) {
                hideNotification();
                setStatus(variant.name + " deselected");
                return;
            }

            button.classList.add("selected");
            showNotification(variant.name);
            setStatus(variant.name + " selected");
        };

        grid.appendChild(button);
    });

    // Popup positioning logic same rahega...
    const buttonRect = event.currentTarget.getBoundingClientRect();
    let left = buttonRect.right + 10;
    let top = buttonRect.top;

    const popupWidth = 330;
    const popupHeight = 300;

    if (left + popupWidth > window.innerWidth - 10) {
        left = buttonRect.left - popupWidth - 10;
    }
    if (top + popupHeight > window.innerHeight - 10) {
        top = window.innerHeight - popupHeight - 10;
    }

    picker.style.left = Math.max(10, left) + "px";
    picker.style.top = Math.max(10, top) + "px";
    picker.classList.add("show");
}

function closeSymbolPicker() {

    const picker =
        document.getElementById("symbolPicker");

    if (!picker) return;

    picker.classList.remove("show");
}


function createMilSymbol(sidc, size = 55) {

    const symbol = new ms.Symbol(sidc, {
        size: size
    });

    return symbol.asSVG();
}



/* =====================================================
   TERRAIN STATE
===================================================== */
let radius = 1500;
let power = 2.0;
let maxHeight = 499;

let statusTimer;
let notificationTimer;


/* =====================================================
   SECTION DROPDOWNS
===================================================== */

function toggleSection(header) {
    header.closest(".control-section").classList.toggle("open");
}


/* =====================================================
   SELECTION
===================================================== */

function selectOption(button, name) {

    const section = button.closest(".control-section");
    const selected = button.classList.contains("selected");

    section.querySelectorAll(".tool-button.selected")
        .forEach(btn => btn.classList.remove("selected"));

    // Clicking the already-selected button = deselect
    if (selected) {
        hideNotification();
        setStatus(name + " deselected");
        return;
    }

    button.classList.add("selected");

    showNotification(name);
    setStatus(name + " selected");
}


/* =====================================================
   BRUSH MODE
===================================================== */


function selectBrushMode(button) {

    const selected = button.classList.contains("selected");

    document
        .querySelectorAll(".mode-button")
        .forEach(btn => btn.classList.remove("selected"));

    if (selected) {
        hideNotification();
        setStatus(button.innerText.trim() + " deselected");
        return;
    }

    button.classList.add("selected");

    const name = button.innerText.trim();

    showNotification(name);
    setStatus(name + " selected");
}


/* =====================================================
   TERRAIN TOOL
===================================================== */

function activateTool(button) {

    const name = button.innerText.trim();

    selectOption(button, name);
}


/* =====================================================
   VALUE CONTROLS
===================================================== */

function changeRadius(amount) {

    radius = clamp(radius + amount, 100, 10000);

    update("radiusValue", radius + " m");

    setStatus("Brush radius: " + radius + " m");
}


function changePower(amount) {

    power = clamp(power + amount, 0, 100);
    power = Math.round(power * 10) / 10;

    update("powerValue", power.toFixed(1) + " m");

    setStatus("Brush power: " + power.toFixed(1) + " m");
}


function changeMaxHeight(amount) {

    maxHeight = clamp(maxHeight + amount, 0, 10000);

    update("maxHeightValue", maxHeight + " m");

    setStatus("Maximum height: " + maxHeight + " m");
}


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


function update(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}


/* =====================================================
   INPUT STEPPERS
===================================================== */

function changeInput(id, amount) {

    const input = document.getElementById(id);

    if (!input) return;

    input.value = Math.max(0, Number(input.value) + amount);

    setStatus(
        input.id + ": " + input.value
    );
}


/* =====================================================
   MASK
===================================================== */

function toggleMask(event) {

    if (event) event.stopPropagation();

    const button = document.getElementById("maskButton");

    const enabled =
        button.dataset.enabled === "true";

    button.dataset.enabled = String(!enabled);

    button.textContent =
        `Mask: ${enabled ? "OFF" : "ON"}`;

    button.classList.toggle(
        "mask-on",
        !enabled
    );

    showNotification(
        `Terrain Mask ${enabled ? "OFF" : "ON"}`
    );

    setStatus(
        `Terrain mask ${enabled ? "disabled" : "enabled"}`
    );
}


/* =====================================================
   UNDO / REDO / RESET
===================================================== */

function performAction(action) {

    // Actions are momentary, so remove selection
    document
        .querySelectorAll(".tool-button.selected, .mode-button.selected")
        .forEach(btn => {
            btn.classList.remove("selected");
        });

    showNotification(action);

    setStatus(
        action === "Undo"
            ? "Undo terrain change"
            : action === "Redo"
                ? "Redo terrain change"
                : "Terrain reset"
    );
}


/* =====================================================
   CENTER NOTIFICATION
===================================================== */

function hideNotification() {
    const notification =
        document.getElementById("toolNotification");

    if (notification) {
        notification.classList.remove("show");
    }
}


function showNotification(name) {

    const notification =
        document.getElementById("toolNotification");

    const text =
        document.getElementById("notificationText");

    if (!notification || !text) return;

    text.textContent = name;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 1500);
}


/* =====================================================
   STATUS BAR
===================================================== */

function setStatus(message) {

    const status =
        document.getElementById("statusText");

    if (!status) return;

    status.textContent = message;

    clearTimeout(statusTimer);

    statusTimer = setTimeout(() => {
        status.textContent =
            "Terrain editor ready";
    }, 2500);
}


/* =====================================================
   PANEL RESIZE
===================================================== */

const panel = document.querySelector(".terrain-panel");

let resizing = false;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;

const MIN_WIDTH = 320;
const MAX_WIDTH = 650;

const MIN_HEIGHT = 350;

function isResizeCorner(event) {

    const rect = panel.getBoundingClientRect();

    return (
        event.clientX >= rect.right - 22 &&
        event.clientY >= rect.bottom - 22
    );
}

panel.addEventListener("pointerdown", event => {

    if (!isResizeCorner(event)) return;

    resizing = true;

    startX = event.clientX;
    startY = event.clientY;

    startWidth = panel.offsetWidth;
    startHeight = panel.offsetHeight;

    panel.classList.add("resizing");

    panel.setPointerCapture(event.pointerId);

    event.preventDefault();
});

panel.addEventListener("pointermove", event => {

    if (!resizing) return;

    const width =
        Math.min(
            MAX_WIDTH,
            Math.max(
                MIN_WIDTH,
                startWidth + event.clientX - startX
            )
        );

    const height =
        Math.min(
            window.innerHeight * 0.9,
            Math.max(
                MIN_HEIGHT,
                startHeight + event.clientY - startY
            )
        );

    panel.style.width = width + "px";
    panel.style.height = height + "px";
});

panel.addEventListener("pointerup", () => {

    if (!resizing) return;

    resizing = false;

    panel.classList.remove("resizing");
});

panel.addEventListener("pointercancel", () => {

    resizing = false;

    panel.classList.remove("resizing");
});


window.toggleSection = toggleSection;
window.selectOption = selectOption;
window.selectBrushMode = selectBrushMode;
window.activateTool = activateTool;
window.changeRadius = changeRadius;
window.changePower = changePower;
window.changeMaxHeight = changeMaxHeight;
window.changeInput = changeInput;
window.toggleMask = toggleMask;
window.performAction = performAction;
window.openSymbolPicker = openSymbolPicker;
window.closeSymbolPicker = closeSymbolPicker;