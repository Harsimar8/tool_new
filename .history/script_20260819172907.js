/* =====================================================
   LOAD TOOLS CONFIG
===================================================== */

let toolsConfig = null;


/* =====================================================
   LOAD JSON
===================================================== */

async function loadTools() {

    try {

        const response = await fetch("./tools.json");

        if (!response.ok) {
            throw new Error("Could not load tools.json");
        }

        toolsConfig = await response.json();

        console.log("tools.json loaded:", toolsConfig);

        renderPanel();

    } catch (error) {

        console.error("Failed to load tools.json:", error);

    }

}


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



/* =====================================================
   GLOBAL
===================================================== */

window.toggleSection = toggleSection;