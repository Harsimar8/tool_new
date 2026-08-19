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