import toolConfig from "./tools.json";
import ms from "milsymbol";

const container = document.getElementById("terrainPanelContent");

if (!container) {
    throw new Error("terrainPanelContent not found");
}


/* =====================================================
   PANEL HEADER
===================================================== */

container.innerHTML = `
    <div class="panel-header">

        <div class="panel-brand">

            <div class="brand-mark">
                ${toolConfig.panel.icon}
            </div>

            <div>
                <div class="panel-title">
                    ${toolConfig.panel.title}
                </div>

                <div class="panel-subtitle">
                    ${toolConfig.panel.subtitle}
                </div>
            </div>

        </div>

        <button
            type="button"
            class="panel-menu">
            ⋮
        </button>

    </div>
`;


/* =====================================================
   SECTIONS
===================================================== */

toolConfig.sections.forEach(section => {

    const sectionElement =
        document.createElement("section");

    sectionElement.className =
        "control-section";

    sectionElement.dataset.sectionId =
        section.id;


    /* ---------------------------------------------
       SECTION HEADER
    --------------------------------------------- */

    sectionElement.innerHTML = `
        <div class="section-title">

            <div class="section-title-left">

                <span class="section-indicator"></span>

                <span class="section-name">
                    ${section.title}
                </span>

            </div>

            <span class="arrow">
                ▾
            </span>

        </div>

        <div class="section-content"></div>
    `;


    const content =
        sectionElement.querySelector(".section-content");


    /* =================================================
       CREATE GROUPS
    ================================================= */

    let buttonGrid = null;
    let modeGrid = null;
    let symbolGrid = null;


    /* =================================================
       ADD ITEMS
    ================================================= */

    section.items.forEach(item => {

        /* ---------------------------------------------
           NORMAL BUTTONS
        --------------------------------------------- */

        if (item.type === "button") {

            if (!buttonGrid) {

                buttonGrid =
                    document.createElement("div");

                buttonGrid.className =
                    "button-grid";

                content.appendChild(buttonGrid);
            }

            buttonGrid.appendChild(
                createButton(item)
            );

            return;
        }


        /* ---------------------------------------------
           BRUSH / MODE BUTTONS
        --------------------------------------------- */

        if (item.type === "mode") {

            if (!modeGrid) {

                modeGrid =
                    document.createElement("div");

                modeGrid.className =
                    "tool-mode-grid";

                content.appendChild(modeGrid);
            }

            modeGrid.appendChild(
                createMode(item)
            );

            return;
        }


        /* ---------------------------------------------
           NUMBER CONTROLS
        --------------------------------------------- */

        if (item.type === "number") {

            content.appendChild(
                createNumber(item)
            );

            return;
        }


        /* ---------------------------------------------
           TOGGLE
        --------------------------------------------- */

        if (item.type === "toggle") {

    if (!buttonGrid) {

        buttonGrid =
            document.createElement("div");

        buttonGrid.className =
            "button-grid";

        content.appendChild(buttonGrid);
    }

    buttonGrid.appendChild(
        createToggle(item)
    );

    return;
}


        /* ---------------------------------------------
           SYMBOL CATEGORIES
        --------------------------------------------- */

        if (item.type === "symbolCategory") {

            if (!symbolGrid) {

                symbolGrid =
                    document.createElement("div");

                symbolGrid.className =
                    "symbol-category-grid";

                content.appendChild(symbolGrid);
            }

            symbolGrid.appendChild(
                createSymbolCategory(item)
            );

            return;
        }

    });


    /* ---------------------------------------------
       ADD SECTION TO PANEL
    --------------------------------------------- */

    container.appendChild(sectionElement);

});


/* =====================================================
   STATUS
===================================================== */

container.insertAdjacentHTML(
    "beforeend",
    `
        <div class="panel-status">

            <span class="status-dot"></span>

            <span id="statusText">
                ${toolConfig.status.defaultText}
            </span>

        </div>
    `
);


/* =====================================================
   ITEM CREATION
===================================================== */

function createItem(item) {

    if (item.type === "button") {
        return createButton(item);
    }

    if (item.type === "mode") {
        return createMode(item);
    }

    if (item.type === "number") {
        return createNumber(item);
    }

    if (item.type === "toggle") {
        return createToggle(item);
    }

    if (item.type === "symbolCategory") {
        return createSymbolCategory(item);
    }

    return document.createElement("div");
}


/* =====================================================
   NORMAL BUTTON
===================================================== */

function createButton(item) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "tool-button";

    button.dataset.toolId =
        item.id;


    if (item.wide) {
        button.classList.add("wide");
    }


    button.innerHTML = `

        ${item.icon
            ? `
                <span class="button-icon">
                    ${item.icon}
                </span>
              `
            : ""
        }

        <span class="button-label">
            ${item.label}
        </span>

        ${item.value
            ? `
                <span class="button-value">
                    ${item.value}
                </span>
              `
            : ""
        }

    `;


    return button;
}


/* =====================================================
   MODE BUTTON
===================================================== */

function createMode(item) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "mode-button";

    button.dataset.toolId =
        item.id;


    button.innerHTML = `

        ${item.icon
            ? `
                <span class="mode-icon">
                    ${item.icon}
                </span>
              `
            : ""
        }

        <span class="button-label">
            ${item.label}
        </span>

    `;


    return button;
}


/* =====================================================
   NUMBER CONTROL
===================================================== */

function createNumber(item) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "value-control";

    wrapper.dataset.toolId =
        item.id;

    wrapper.dataset.value =
        item.value;

    wrapper.dataset.step =
        item.step ?? 1;

    wrapper.dataset.unit =
        item.unit ?? "";


    wrapper.innerHTML = `

        <div class="value-info">

            <span class="value-label">
                ${item.label}
            </span>

            <span
                class="value-number"
                id="${item.id}Value">

                ${item.value}${item.unit || ""}

            </span>

        </div>


        <div class="mini-stepper">

            <button
                type="button"
                data-action="decrease">

                −

            </button>

            <button
                type="button"
                data-action="increase">

                +

            </button>

        </div>

    `;


    return wrapper;
}


/* =====================================================
   TOGGLE
===================================================== */

/* =====================================================
   TOGGLE
===================================================== */

function createToggle(item) {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "tool-button mask-toggle";

    button.id = `${item.id}Button`;

    button.dataset.toolId = item.id;

    button.dataset.toolType = "toggle";

    button.dataset.enabled =
        item.value ? "true" : "false";


    /* ---------------------------------------------
       INITIAL STATE
    --------------------------------------------- */

    if (item.value) {
        button.classList.add("mask-on");
    }


    /* ---------------------------------------------
       LABEL
    --------------------------------------------- */

    button.innerHTML = `
        <span class="button-label">
            ${
                item.value
                    ? item.onLabel
                    : item.offLabel
            }
        </span>
    `;


    return button;
}


/* =====================================================
   SYMBOL CATEGORY
===================================================== */

function createSymbolCategory(item) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "symbol-category-button";

    button.dataset.toolId =
        item.id;

    button.dataset.symbols =
        JSON.stringify(item.symbols || []);


    if (item.wide) {
        button.classList.add("wide");
    }


    button.innerHTML = `

        <span class="symbol-category-icon">
            ${item.icon || "◈"}
        </span>

        <span class="symbol-category-name">
            ${item.label}
        </span>

    `;


    return button;
}