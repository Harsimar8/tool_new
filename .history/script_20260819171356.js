
import ms from "milsymbol";

/* =====================================================
   LOAD TOOLS.JSON
===================================================== */

let toolsConfig = null;

/* =====================================================
   LOAD PANEL
===================================================== */

async function loadTools() {

    try {

        const response = await fetch("./tools.json");

        if (!response.ok) {
            throw new Error(
                `Failed to load tools.json: ${response.status}`
            );
        }

        toolsConfig = await response.json();

        console.log("tools.json loaded:", toolsConfig);

        renderPanel();

    } catch (error) {

        console.error(
            "Could not load tools.json:",
            error
        );

    }

}


/* =====================================================
   RENDER COMPLETE PANEL
===================================================== */

function renderPanel() {

    const panel =
        document.getElementById("terrainTools");

    if (!panel || !toolsConfig) return;

    panel.innerHTML = "";


    /* -------------------------------------------------
       HEADER
    ------------------------------------------------- */

    panel.innerHTML += `

        <div class="panel-header">

            <div class="panel-brand">

                <div class="brand-mark">
                    ${toolsConfig.panel.icon}
                </div>

                <div class="brand-text">

                    <div class="panel-title">
                        ${toolsConfig.panel.title}
                    </div>

                    <div class="panel-subtitle">
                        ${toolsConfig.panel.subtitle}
                    </div>

                </div>

            </div>

            <button
                class="panel-menu"
                title="Terrain tools menu">

                ⋮

            </button>

        </div>

    `;


    /* -------------------------------------------------
       SECTIONS
    ------------------------------------------------- */

    toolsConfig.sections.forEach(section => {

        panel.innerHTML +=
            renderSection(section);

    });


    /* -------------------------------------------------
       STATUS
    ------------------------------------------------- */

    if (toolsConfig.status) {

        panel.innerHTML += `

            <div class="panel-status">

                <span class="status-dot"></span>

                <span id="statusText">
                    ${toolsConfig.status.defaultText}
                </span>

            </div>

        `;

    }


    /* -------------------------------------------------
       CONNECT SECTION EVENTS
    ------------------------------------------------- */

    setupPanelEvents();


    /* -------------------------------------------------
       RESIZE
    ------------------------------------------------- */

    setupPanelResize();

}


/* =====================================================
   RENDER SECTION
===================================================== */

function renderSection(section) {

    let content = "";


    /* -------------------------------------------------
       NORMAL TOOLS
    ------------------------------------------------- */

    if (
        section.type === "tools" ||
        section.type === "sculpt"
    ) {

        content = renderItems(section.items);

    }


    /* -------------------------------------------------
       SYMBOLS
    ------------------------------------------------- */

    else if (section.type === "symbols") {

        content = `

            <div class="symbol-category-grid">

                ${section.items
                    .map(item => renderSymbolCategory(item))
                    .join("")}

            </div>

        `;

    }


    return `

        <section
            class="control-section"
            data-section-id="${section.id}">

            <div
                class="section-title"
                data-action="toggleSection">

                <div class="section-title-left">

                    <span class="section-indicator"></span>

                    <span class="section-icon">
                        ${section.icon}
                    </span>

                    <span class="section-name">
                        ${section.title}
                    </span>

                </div>

                <span class="arrow">
                    ▾
                </span>

            </div>


            <div class="section-content">

                ${content}

            </div>

        </section>

    `;

}


/* =====================================================
   RENDER ITEMS
===================================================== */

function renderItems(items) {

    let html = "";

    let normalButtons = [];
    let otherItems = [];


    items.forEach(item => {

        if (
            item.type === "button" ||
            item.type === "mode"
        ) {

            normalButtons.push(item);

        } else {

            otherItems.push(item);

        }

    });


    /* -------------------------------------------------
       BUTTONS
    ------------------------------------------------- */

    if (normalButtons.length) {

        const modeButtons =
            normalButtons.filter(
                item => item.type === "mode"
            );

        const normalToolButtons =
            normalButtons.filter(
                item => item.type === "button"
            );


        if (modeButtons.length) {

            html += `

                <div class="tool-mode-grid">

                    ${modeButtons
                        .map(item => renderModeButton(item))
                        .join("")}

                </div>

            `;

        }


        if (normalToolButtons.length) {

            html += `

                <div class="button-grid">

                    ${normalToolButtons
                        .map(item => renderButton(item))
                        .join("")}

                </div>

            `;

        }

    }


    /* -------------------------------------------------
       OTHER ITEMS
    ------------------------------------------------- */

    otherItems.forEach(item => {

        if (item.type === "number") {

            html += renderNumber(item);

        }

        else if (item.type === "actionGroup") {

            html += renderActionGroup(item);

        }

        else if (item.type === "action") {

            html += renderAction(item);

        }

        else if (item.type === "toggle") {

            html += renderToggle(item);

        }

    });


    return html;

}


/* =====================================================
   NORMAL BUTTON
===================================================== */

function renderButton(item) {

    return `

        <button
            class="tool-button ${item.wide ? "wide" : ""}"
            data-tool-id="${item.id}"
            data-action="${item.action}">

            ${item.icon
                ? `<span class="button-icon">${item.icon}</span>`
                : ""}

            ${item.id === "terrainExaggeration"
                ? `
                    <span class="button-main">
                        ${item.label}
                    </span>

                    <span class="button-value">
                        ${item.value || ""}
                    </span>
                  `
                : item.label}

        </button>

    `;

}


/* =====================================================
   MODE BUTTON
===================================================== */

function renderModeButton(item) {

    return `

        <button
            class="mode-button"
            data-tool-id="${item.id}"
            data-action="${item.action}">

            <span class="mode-icon">
                ${item.icon || ""}
            </span>

            <span>
                ${item.label}
            </span>

        </button>

    `;

}


/* =====================================================
   NUMBER CONTROL
===================================================== */

function renderNumber(item) {

    const valueId =
        `${item.id}Value`;

    const step =
        item.step || 1;

    return `

        <div class="value-control">

            <div class="value-info">

                <span class="value-label">
                    ${item.label}
                </span>

                <span
                    class="value-number"
                    id="${valueId}">

                    ${formatValue(item)}

                </span>

            </div>


            <div class="mini-stepper">

                <button
                    data-number-id="${item.id}"
                    data-change="-${step}">

                    −

                </button>

                <button
                    data-number-id="${item.id}"
                    data-change="${step}">

                    +

                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatValue(item) {

    let value = item.value;

    if (item.id === "power") {

        value =
            Number(value).toFixed(1);

    }

    return `${value} ${item.unit || ""}`;

}


/* =====================================================
   ACTION GROUP
===================================================== */

function renderActionGroup(item) {

    return `

        <div class="control-divider"></div>

        <div class="button-grid">

            ${item.items
                .map(child => renderButton(child))
                .join("")}

        </div>

    `;

}


/* =====================================================
   SINGLE ACTION
===================================================== */

function renderAction(item) {

    return `

        <button
            class="reset-button"
            data-tool-id="${item.id}"
            data-action="${item.action}">

            ${item.icon || ""}
            ${item.label}

        </button>

    `;

}


/* =====================================================
   TOGGLE
===================================================== */

function renderToggle(item) {

    const label =
        item.value
            ? item.onLabel
            : item.offLabel;

    return `

        <button
            class="tool-button"
            data-tool-id="${item.id}"
            data-action="${item.action}"
            data-enabled="${item.value}">

            ${label}

        </button>

    `;

}


/* =====================================================
   SYMBOL CATEGORY
===================================================== */

function renderSymbolCategory(item) {

    return `

        <button
            class="symbol-category-button ${item.wide ? "wide" : ""}"
            data-symbol-category="${item.label}"
            data-action="${item.action}">

            <span class="symbol-category-icon">

                ${item.icon || ""}

            </span>

            <span class="symbol-category-name">

                ${item.label}

            </span>

        </button>

    `;

}


/* =====================================================
   PANEL EVENTS
===================================================== */

function setupPanelEvents() {

    const panel =
        document.getElementById("terrainTools");

    if (!panel) return;


    /* -------------------------------------------------
       SECTION TOGGLE
    ------------------------------------------------- */

    panel
        .querySelectorAll(
            '[data-action="toggleSection"]'
        )
        .forEach(header => {

            header.addEventListener(
                "click",
                () => toggleSection(header)
            );

        });


    /* -------------------------------------------------
       NORMAL BUTTONS
    ------------------------------------------------- */

    panel
        .querySelectorAll(
            ".tool-button[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    console.log(
                        "Tool clicked:",
                        action
                    );

                    handleAction(
                        button,
                        action
                    );

                }
            );

        });


    /* -------------------------------------------------
       MODE BUTTONS
    ------------------------------------------------- */

    panel
        .querySelectorAll(
            ".mode-button[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    handleAction(
                        button,
                        action
                    );

                }
            );

        });


    /* -------------------------------------------------
       NUMBER STEPPERS
    ------------------------------------------------- */

    panel
        .querySelectorAll(
            "[data-number-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.numberId;

                    const amount =
                        Number(
                            button.dataset.change
                        );

                    changeNumber(
                        id,
                        amount
                    );

                }
            );

        });


    /* -------------------------------------------------
       SYMBOL CATEGORIES
    ------------------------------------------------- */

    panel
        .querySelectorAll(
            "[data-symbol-category]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    openSymbolPicker(
                        event,
                        button.dataset.symbolCategory
                    );

                }
            );

        });

}


/* =====================================================
   ACTION ROUTER
===================================================== */

function handleAction(button, action) {

    console.log(
        "ACTION:",
        action
    );


    /*
       TEMPORARY ONLY.

       We are NOT connecting Cesium yet.

       For now this simply reproduces
       your current UI selection behavior.
    */


    if (button.classList.contains("mode-button")) {

        selectBrushMode(button);

        return;

    }


    if (action === "toggleMask") {

        toggleMask({
            currentTarget: button,
            stopPropagation() {}
        });

        return;

    }


    if (
        action === "undo" ||
        action === "redo" ||
        action === "resetTerrain"
    ) {

        performAction(
            action === "undo"
                ? "Undo"
                : action === "redo"
                    ? "Redo"
                    : "Reset"
        );

        return;

    }


    selectOption(
        button,
        getActionLabel(button)
    );

}


/* =====================================================
   GET DISPLAY LABEL
===================================================== */

function getActionLabel(button) {

    const main =
        button.querySelector(".button-main");

    if (main) {

        return main.textContent.trim();

    }

    return button.innerText.trim();

}


/* =====================================================
   NUMBER CONTROL
===================================================== */

function changeNumber(id, amount) {

    const item =
        findItemById(id);

    if (!item) return;


    item.value =
        Number(item.value) + amount;


    /* Limits */

    if (id === "radius") {

        item.value =
            clamp(item.value, 100, 10000);

        radius = item.value;

    }

    else if (id === "power") {

        item.value =
            clamp(item.value, 0, 100);

        item.value =
            Math.round(item.value * 10) / 10;

        power = item.value;

    }

    else if (id === "maxHeight") {

        item.value =
            clamp(item.value, 0, 10000);

        maxHeight = item.value;

    }

    else if (id === "pathWidth") {

        item.value =
            Math.max(0, item.value);

    }

    else if (id === "digDepth") {

        item.value =
            Math.max(0, item.value);

    }


    update(
        `${id}Value`,
        formatValue(item)
    );


    setStatus(
        `${item.label}: ${item.value} ${item.unit || ""}`
    );

}


/* =====================================================
   FIND ITEM
===================================================== */

function findItemById(id) {

    if (!toolsConfig) return null;


    for (const section of toolsConfig.sections) {

        for (const item of section.items) {

            if (item.id === id) {

                return item;

            }


            if (item.type === "actionGroup") {

                for (const child of item.items) {

                    if (child.id === id) {

                        return child;

                    }

                }

            }

        }

    }

    return null;

}


/* =====================================================
   TERRAIN STATE
===================================================== */

let radius = 1500;
let power = 2.0;
let maxHeight = 499;


/* =====================================================
   TIMERS
===================================================== */

let statusTimer;
let notificationTimer;


/* =====================================================
   SECTION DROPDOWN
===================================================== */

function toggleSection(header) {

    const section =
        header.closest(".control-section");

    if (!section) return;

    section.classList.toggle("open");

}


/* =====================================================
   SELECTION
===================================================== */

function selectOption(button, name) {

    const section =
        button.closest(".control-section");

    if (!section) return;


    const selected =
        button.classList.contains("selected");


    section
        .querySelectorAll(
            ".tool-button.selected"
        )
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

        });


    if (selected) {

        hideNotification();

        setStatus(
            name + " deselected"
        );

        return;

    }


    button.classList.add("selected");


    showNotification(name);

    setStatus(
        name + " selected"
    );

}


/* =====================================================
   BRUSH MODE
===================================================== */

function selectBrushMode(button) {

    const selected =
        button.classList.contains("selected");


    document
        .querySelectorAll(".mode-button")
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

        });


    if (selected) {

        hideNotification();

        setStatus(
            button.innerText.trim() +
            " deselected"
        );

        return;

    }


    button.classList.add("selected");


    const name =
        button.innerText.trim();


    showNotification(name);

    setStatus(
        name + " selected"
    );

}


/* =====================================================
   CLAMP
===================================================== */

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


/* =====================================================
   UPDATE ELEMENT
===================================================== */

function update(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =====================================================
   MASK
===================================================== */

function toggleMask(event) {

    if (event) {

        event.stopPropagation();

    }


    const button =
        event?.currentTarget ||
        document.querySelector(
            '[data-action="toggleMask"]'
        );


    if (!button) return;


    const enabled =
        button.dataset.enabled === "true";


    button.dataset.enabled =
        String(!enabled);


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
        `Terrain mask ${
            enabled
                ? "disabled"
                : "enabled"
        }`
    );

}


/* =====================================================
   UNDO / REDO / RESET
===================================================== */

function performAction(action) {

    document
        .querySelectorAll(
            ".tool-button.selected, .mode-button.selected"
        )
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

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
        document.getElementById(
            "toolNotification"
        );


    if (notification) {

        notification.classList.remove(
            "show"
        );

    }

}


function showNotification(name) {

    const notification =
        document.getElementById(
            "toolNotification"
        );


    const text =
        document.getElementById(
            "notificationText"
        );


    if (!notification || !text) return;


    text.textContent =
        name;


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notificationTimer
    );


    notificationTimer =
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 1500);

}


/* =====================================================
   STATUS BAR
===================================================== */

function setStatus(message) {

    const status =
        document.getElementById(
            "statusText"
        );


    if (!status) return;


    status.textContent =
        message;


    clearTimeout(
        statusTimer
    );


    statusTimer =
        setTimeout(() => {

            status.textContent =
                "Terrain editor ready";

        }, 2500);

}


/* =====================================================
   PANEL RESIZE
===================================================== */

function setupPanelResize() {

    const panel =
        document.querySelector(
            ".terrain-panel"
        );


    if (!panel) return;


    let resizing = false;

    let startX = 0;
    let startY = 0;

    let startWidth = 0;
    let startHeight = 0;


    const MIN_WIDTH = 320;
    const MAX_WIDTH = 650;

    const MIN_HEIGHT = 350;


    function isResizeCorner(event) {

        const rect =
            panel.getBoundingClientRect();


        return (

            event.clientX >=
                rect.right - 22 &&

            event.clientY >=
                rect.bottom - 22

        );

    }


    panel.addEventListener(
        "pointerdown",
        event => {

            if (
                !isResizeCorner(event)
            ) return;


            resizing = true;


            startX =
                event.clientX;

            startY =
                event.clientY;


            startWidth =
                panel.offsetWidth;

            startHeight =
                panel.offsetHeight;


            panel.classList.add(
                "resizing"
            );


            panel.setPointerCapture(
                event.pointerId
            );


            event.preventDefault();

        }
    );


    panel.addEventListener(
        "pointermove",
        event => {

            if (!resizing) return;


            const width =
                Math.min(
                    MAX_WIDTH,

                    Math.max(
                        MIN_WIDTH,

                        startWidth +
                        event.clientX -
                        startX
                    )
                );


            const height =
                Math.min(

                    window.innerHeight *
                    0.9,

                    Math.max(
                        MIN_HEIGHT,

                        startHeight +
                        event.clientY -
                        startY
                    )

                );


            panel.style.width =
                width + "px";

            panel.style.height =
                height + "px";

        }
    );


    panel.addEventListener(
        "pointerup",
        () => {

            resizing = false;

            panel.classList.remove(
                "resizing"
            );

        }
    );


    panel.addEventListener(
        "pointercancel",
        () => {

            resizing = false;

            panel.classList.remove(
                "resizing"
            );

        }
    );

}


/* =====================================================
   MILITARY SYMBOLS
   TEMPORARILY KEPT HERE
   WE WILL MOVE THESE INTO tools.json NEXT
===================================================== */

function createMilSymbol(
    sidc,
    size = 55
) {

    const symbol =
        new ms.Symbol(
            sidc,
            {
                size: size
            }
        );


    return symbol.asSVG();

}


/* =====================================================
   SYMBOL PICKER
   CURRENT SYMBOL DATA
   WILL BE CONNECTED TO JSON NEXT
===================================================== */

const symbolVariants = {

    Radar: [

        {
            name: "Ground Surveillance Radar",
            sidc: "10035000001103000800"
        },

        {
            name: "Early Warning Radar",
            sidc: "10035000001103001600"
        },

        {
            name: "Fire Control Radar",
            sidc: "10035000001103001700"
        },

        {
            name: "Air Defense Radar",
            sidc: "10035000001103000100"
        }

    ],

    Tank: [

        {
            name: "Tank",
            sidc: "10031500001202000000"
        },

        {
            name: "Light Tank",
            sidc: "10031500001202010000"
        },

        {
            name: "Medium Tank",
            sidc: "10031500001202020000"
        },

        {
            name: "Heavy Tank",
            sidc: "10031500001202030000"
        }

    ],

    Missile: [

        {
            name: "Missile",
            sidc: "10030200001100000000"
        },

        {
            name: "Surface-to-Surface Missile",
            sidc: "10030200001100000202"
        },

        {
            name: "Surface-to-Air Missile",
            sidc: "10030200001100000201"
        },

        {
            name: "Air-to-Surface Missile",
            sidc: "10030200001100000102"
        }

    ],

    SAM: [

        {
            name: "Surface-to-Air Missile",
            sidc: "10030200001100000201"
        },

        {
            name: "Short Range SAM",
            sidc: "10031500001111010000"
        },

        {
            name: "Medium Air Defense Missile Launcher",
            sidc: "10031500001111040000"
        },

        {
            name: "S-400 / SA-21",
            sidc: "10031500001111030000"
        }

    ],

    Bomber: [

        {
            name: "Bomber",
            sidc: "10030100001101030000"
        },

        {
            name: "Fighter-Bomber",
            sidc: "10030100001101050000"
        },

        {
            name: "Attack / Strike Aircraft",
            sidc: "10030100001101020000"
        },

        {
            name: "Reconnaissance Aircraft",
            sidc: "10030100001101110000"
        }

    ]

};


/* =====================================================
   SYMBOL PICKER
===================================================== */

function openSymbolPicker(
    event,
    category
) {

    event.stopPropagation();


    const picker =
        document.getElementById(
            "symbolPicker"
        );


    const title =
        document.getElementById(
            "symbolPickerTitle"
        );


    const grid =
        document.getElementById(
            "symbolPickerGrid"
        );


    if (!picker || !title || !grid) {

        console.error(
            "Symbol picker elements not found"
        );

        return;

    }


    title.textContent =
        category.toUpperCase();


    grid.innerHTML = "";


    const variants =
        symbolVariants[category] || [];


    variants.forEach(
        variant => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "symbol-subtype";


            const svg =
                createMilSymbol(
                    variant.sidc,
                    35
                );


            button.innerHTML = `

                <span class="symbol-subtype-icon">

                    ${svg}

                </span>

                <span class="symbol-subtype-name">

                    ${variant.name}

                </span>

            `;


            button.onclick =
                function (e) {

                    e.stopPropagation();


                    const alreadySelected =
                        button.classList.contains(
                            "selected"
                        );


                    document
                        .querySelectorAll(
                            ".symbol-subtype"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "selected"
                            );

                        });


                    if (
                        alreadySelected
                    ) {

                        hideNotification();


                        setStatus(
                            variant.name +
                            " deselected"
                        );


                        return;

                    }


                    button.classList.add(
                        "selected"
                    );


                    showNotification(
                        variant.name
                    );


                    setStatus(
                        variant.name +
                        " selected"
                    );


                    console.log(
                        "Symbol selected:",
                        category,
                        variant.name
                    );

                };


            grid.appendChild(
                button
            );

        }
    );


    const buttonRect =
        event.currentTarget
            .getBoundingClientRect();


    let left =
        buttonRect.right + 10;


    let top =
        buttonRect.top;


    const popupWidth = 330;
    const popupHeight = 300;


    if (
        left + popupWidth >
        window.innerWidth - 10
    ) {

        left =
            buttonRect.left -
            popupWidth -
            10;

    }


    if (
        top + popupHeight >
        window.innerHeight - 10
    ) {

        top =
            window.innerHeight -
            popupHeight -
            10;

    }


    left =
        Math.max(
            10,
            left
        );


    top =
        Math.max(
            10,
            top
        );


    picker.style.left =
        left + "px";


    picker.style.top =
        top + "px";


    picker.classList.add(
        "show"
    );

}


/* =====================================================
   CLOSE SYMBOL PICKER
===================================================== */

function closeSymbolPicker() {

    const picker =
        document.getElementById(
            "symbolPicker"
        );


    if (!picker) return;


    picker.classList.remove(
        "show"
    );

}


/* =====================================================
   START APPLICATION
===================================================== */

loadTools();
```
