/* =====================================================
   LOAD TOOLS CONFIG
===================================================== */

let toolsConfig = null;





/* =====================================================
   RENDER PANEL
===================================================== */

function renderPanel() {

    const container =
        document.getElementById("terrainPanelContent");

    if (!container) {
        console.error("terrainPanelContent not found");
        return;
    }

    container.innerHTML = "";

    /* HEADER */

    const header = document.createElement("div");

    header.className = "panel-header";

    header.innerHTML = `
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

        <button class="panel-menu" title="Terrain tools menu">
            ⋮
        </button>
    `;

    container.appendChild(header);


    /* SECTIONS */

    toolsConfig.sections.forEach(section => {

        const sectionElement =
            document.createElement("section");

        sectionElement.className =
            "control-section";

        sectionElement.innerHTML = `

            <div class="section-title"
                 onclick="toggleSection(this)">

                <div class="section-title-left">

                    <span class="section-indicator"></span>

                    <span class="section-icon">
                        ${section.icon}
                    </span>

                    <span class="section-name">
                        ${section.title}
                    </span>

                </div>

                <span class="arrow">▾</span>

            </div>

            <div class="section-content"></div>
        `;

        container.appendChild(sectionElement);

    });

}


/* =====================================================
   SECTION DROPDOWN
===================================================== */

function toggleSection(header) {

    header
        .closest(".control-section")
        .classList
        .toggle("open");

}


/* =====================================================
   START
===================================================== */

loadTools();

function renderPanel() {

    const container =
        document.getElementById("terrainPanelContent");

    if (!container || !toolsConfig) return;

    container.innerHTML = "";

    toolsConfig.sections.forEach(section => {

        const sectionElement =
            document.createElement("section");

        sectionElement.className =
            "control-section";

        sectionElement.innerHTML = `
            <div class="section-title" onclick="toggleSection(this)">

                <div class="section-title-left">

                    <span class="section-indicator"></span>

                    <span class="section-icon">
                        ${section.icon || ""}
                    </span>

                    <span class="section-name">
                        ${section.title}
                    </span>

                </div>

                <span class="arrow">▾</span>

            </div>

            <div class="section-content">
            </div>
        `;

        const content =
            sectionElement.querySelector(".section-content");

        section.items.forEach(item => {

            if (item.type === "button") {
                renderButton(content, item);
            }

        });

        container.appendChild(sectionElement);
    });
}


function renderButton(container, item) {

    const button =
        document.createElement("button");

    button.className =
        "tool-button";

    if (item.wide) {
        button.classList.add("wide");
    }

    button.dataset.action =
        item.action || "";

    button.innerHTML = `
        ${item.icon
            ? `<span class="button-icon">${item.icon}</span>`
            : ""
        }

        <span class="button-main">
            ${item.label}
        </span>

        ${item.value
            ? `<span class="button-value">${item.value}</span>`
            : ""
        }
    `;

    button.addEventListener("click", () => {

        console.log(
            "Clicked JSON item:",
            item.id,
            item.action
        );

    });

    container.appendChild(button);
}

/* =====================================================
   GLOBAL
===================================================== */

window.toggleSection = toggleSection;