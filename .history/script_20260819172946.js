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