document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("tools.json");
        const data = await response.json();
        
        renderHeader(data.panel);
        renderSections(data.sections);
    } catch (error) {
        console.error("Failed to load tools.json:", error);
    }
});

function renderHeader(panelData) {
    const headerContainer = document.getElementById("panelHeaderContainer");
    if (!headerContainer) return;

    headerContainer.innerHTML = `
        <div class="panel-header">
            <div class="panel-brand">
                <div class="brand-mark">${panelData.icon}</div>
                <div class="brand-text">
                    <div class="panel-title">${panelData.title}</div>
                    <div class="panel-subtitle">${panelData.subtitle}</div>
                </div>
            </div>
            <button class="panel-menu" title="Terrain tools menu">⋮</button>
        </div>
    `;
}

function renderSections(sections) {
    const container = document.getElementById("dynamicPanelContent");
    if (!container) return;
    container.innerHTML = "";

    sections.forEach(section => {
        const sectionEl = document.createElement("section");
        sectionEl.className = "control-section";

        let html = `
            <div class="section-title" onclick="toggleSection(this)">
                <div class="section-title-left">
                    <span class="section-indicator"></span>
                    <span class="section-icon">${section.icon}</span>
                    <span class="section-name">${section.title}</span>
                </div>
                <span class="arrow">▾</span>
            </div>
            <div class="section-content">
        `;

        // We group items intelligently based on their type layout
        let buttonGridActive = false;
        let symbolGridActive = false;

        section.items.forEach((item, index) => {
            const isWide = item.wide ? " wide" : "";

            if (item.type === "button" || item.type === "mode") {
                if (!buttonGridActive && !symbolGridActive) {
                    html += `<div class="button-grid">`;
                    buttonGridActive = true;
                }

                if (item.type === "mode") {
                    html += `
                        <button class="mode-button${isWide}" onclick="selectBrushMode(this)">
                            <span class="mode-icon">${item.icon || "◇"}</span>
                            <span>${item.label}</span>
                        </button>`;
                } else {
                    const iconHTML = item.icon ? `<span class="button-icon">${item.icon}</span>` : "";
                    
                    // Check if it's an action button (Undo, Redo, Reset)
                    const lowerId = (item.id || "").toLowerCase();
                    const lowerLabel = (item.label || "").toLowerCase();
                    const isAction = lowerId.includes("undo") || lowerId.includes("redo") || lowerId.includes("reset") || 
                                     lowerLabel.includes("undo") || lowerLabel.includes("redo") || lowerLabel.includes("reset");

                    const actionHandler = isAction
                        ? `performAction('${item.label.replace(" terrain", "")}')`
                        : `selectOption(this, '${item.label}')`;

                    html += `
                        <button class="tool-button${isWide}" onclick="${actionHandler}">
                            ${iconHTML}
                            <span>${item.label}</span>
                        </button>`;
                }
            }
            else if (item.type === "number") {
                // If a button grid was open, close it first
                if (buttonGridActive) {
                    html += `</div>`;
                    buttonGridActive = false;
                }

                // Check if it's a stepper-based value control (like radius, power, maxHeight) or text input field
                if (item.id === "radius" || item.id === "power" || item.id === "maxHeight") {
                    let stepFnName = item.id === "radius" ? "changeRadius" : item.id === "power" ? "changePower" : "changeMaxHeight";
                    let stepVal = item.step;

                    html += `
                        <div class="value-control">
                            <div class="value-info">
                                <span class="value-label">${item.label}</span>
                                <span class="value-number" id="${item.id}Value">${item.value} ${item.unit || ""}</span>
                            </div>
                            <div class="mini-stepper">
                                <button onclick="${stepFnName}(-(${stepVal}))">−</button>
                                <button onclick="${stepFnName}(${stepVal})">+</button>
                            </div>
                        </div>
                    `;
                } else {
                    // Input text field style (Path width, dig depth)
                    let stepVal = item.step || 1;
                    html += `
                        <div class="field-control">
                            <label>
                                ${item.label} <span>${item.description ? `(${item.description})` : `(${item.unit})`}</span>
                            </label>
                            <div class="field-row">
                                <input type="number" id="${item.id}" value="${item.value}">
                                <button onclick="changeInput('${item.id}', -${stepVal})">−</button>
                                <button onclick="changeInput('${item.id}', ${stepVal})">+</button>
                            </div>
                        </div>
                    `;
                }
            }
            else if (item.type === "symbolCategory") {
                if (buttonGridActive) {
                    html += `</div>`;
                    buttonGridActive = false;
                }
                if (!symbolGridActive) {
                    html += `<div class="symbol-category-grid">`;
                    symbolGridActive = true;
                }

                html += `
                    <button class="symbol-category-button${isWide}" onclick="openSymbolPicker(event, '${item.label}')">
                        <span class="symbol-category-icon">${item.icon}</span>
                        <span class="symbol-category-name">${item.label}</span>
                    </button>
                `;
            }
            else if (item.type === "toggle") {
                if (!buttonGridActive && !symbolGridActive) {
                    html += `<div class="button-grid">`;
                    buttonGridActive = true;
                }
                html += `
                    <button class="tool-button${isWide}" id="maskButton" onclick="toggleMask(event)" data-enabled="false">
                        ${item.offLabel}
                    </button>
                `;
            }

            // Close active grids if it's the last item
            if (index === section.items.length - 1) {
                if (buttonGridActive) html += `</div>`;
                if (symbolGridActive) html += `</div>`;
            }
        });

        html += `</div>`; // Close section-content
        sectionEl.innerHTML = html;
        container.appendChild(sectionEl);
    });
}