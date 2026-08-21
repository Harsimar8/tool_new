import ms from "milsymbol";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("tools.json");
        const data = await response.json();
        window.terrainToolData = data;
        
        renderHeader(data.panel);
        renderRail(data.sections);
        renderSections(data.sections);

        // Open first section by default (or symbols)
        const defaultSection = data.sections.find(s => s.id === "symbols") || data.sections[0];
        if (defaultSection) {
            window.switchSection(defaultSection.id, document.querySelector(`.rail-btn[data-id="${defaultSection.id}"]`));
        }
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
            <button class="panel-menu" title="Menu">⋮</button>
        </div>
    `;
}

// 1. RENDER LEFT NAVIGATION RAIL
function renderRail(sections) {
    const rail = document.getElementById("categoryRail");
    if (!rail) return;
    
    let html = `
        <div class="rail-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
            </svg>
        </div>
    `;

    sections.forEach((section) => {
        html += `
            <button class="rail-btn" data-id="${section.id}" data-tooltip="${section.title}" onclick="switchSection('${section.id}', this)">
                <span class="rail-icon">${section.icon}</span>
            </button>
        `;
    });

    rail.innerHTML = html;
}

// 2. RENDER SECTIONS INSIDE TOOL DRAWER
function renderSections(sections) {
    const container = document.getElementById("dynamicPanelContent");
    if (!container) return;
    container.innerHTML = "";

    sections.forEach(section => {
        const sectionEl = document.createElement("div");
        sectionEl.id = `section-${section.id}`;
        sectionEl.className = "drawer-section";
        sectionEl.style.display = "none";

        let html = `
            <div class="drawer-section-header">
                <div class="drawer-section-title">
                    <span class="sec-icon">${section.icon}</span>
                    <span>${section.title}</span>
                </div>
                <div class="badge-count">${section.items ? section.items.length : 0} Items</div>
            </div>
        `;

        // A. SPECIAL RENDERING FOR SYMBOLS (Search + Filter Pills + 2-Col Cards)
        if (section.id === "symbols") {
            html += `
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="symbolSearch" class="search-input" placeholder="Search radar, SAM, air..." onkeyup="filterCards()">
                </div>
                <div class="filter-pills" id="symbolFilterPills">
                    <button class="filter-pill active" onclick="filterCategory('all', this)">ALL</button>
            `;

            let allSymbols = [];
            section.items.forEach(cat => {
                if (cat.symbols) {
                    html += `<button class="filter-pill" onclick="filterCategory('${cat.id}', this)">${cat.label.toUpperCase()} (${cat.symbols.length})</button>`;
                    cat.symbols.forEach(sym => {
                        allSymbols.push({ ...sym, categoryId: cat.id, categoryLabel: cat.label });
                    });
                }
            });

            html += `</div><div class="symbol-card-grid">`;

            allSymbols.forEach(sym => {
                const svgIcon = createMilSymbolSVG(sym.sidc, 34);
                html += `
                    <div class="tactical-symbol-card" data-category="${sym.categoryId}" data-name="${sym.name}" onclick="selectSymbolCard(this, '${sym.name}')">
                        <div class="card-top">
                            <span class="card-tag">${sym.categoryLabel.toUpperCase()}</span>
                            <span class="status-led"></span>
                        </div>
                        <div class="card-glyph-box">
                            ${svgIcon}
                        </div>
                        <div class="card-bottom">
                            <span class="card-label">${sym.name}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`; // Close symbol-card-grid
        } 
        
        // B. STANDARD BUTTON & CONTROL RENDERING FOR OTHER SECTIONS
        else {
            let buttonGridActive = false;

            section.items.forEach((item, index) => {
                const isWide = item.wide ? " wide" : "";

                if (item.type === "button" || item.type === "mode") {
                    if (!buttonGridActive) {
                        html += `<div class="button-grid">`;
                        buttonGridActive = true;
                    }

                    const isAction = (item.id || "").includes("undo") || (item.id || "").includes("redo") || (item.id || "").includes("reset");
                    const clickAction = isAction 
                        ? `performAction('${item.label}')` 
                        : `selectOption(this, '${item.label}')`;

                    html += `
                        <button class="tool-button${isWide}" onclick="${clickAction}">
                            <span class="button-icon">${item.icon || "◈"}</span>
                            <span>${item.label}</span>
                        </button>
                    `;
                } else if (item.type === "number") {
                    if (buttonGridActive) {
                        html += `</div>`;
                        buttonGridActive = false;
                    }

                    if (item.id === "radius" || item.id === "power" || item.id === "maxHeight") {
                        let stepFnName = item.id === "radius" ? "changeRadius" : item.id === "power" ? "changePower" : "changeMaxHeight";
                        html += `
                            <div class="value-control">
                                <div class="value-info">
                                    <span class="value-label">${item.label}</span>
                                    <span class="value-number" id="${item.id}Value">${item.value} ${item.unit || ""}</span>
                                </div>
                                <div class="mini-stepper">
                                    <button onclick="${stepFnName}(-(${item.step}))">−</button>
                                    <button onclick="${stepFnName}(${item.step})">+</button>
                                </div>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="field-control">
                                <label>${item.label} <span>(${item.description || item.unit})</span></label>
                                <div class="field-row">
                                    <input type="number" id="${item.id}" value="${item.value}">
                                    <button onclick="changeInput('${item.id}', -${item.step || 1})">−</button>
                                    <button onclick="changeInput('${item.id}', ${item.step || 1})">+</button>
                                </div>
                            </div>
                        `;
                    }
                }

                if (index === section.items.length - 1 && buttonGridActive) {
                    html += `</div>`;
                }
            });
        }

        sectionEl.innerHTML = html;
        container.appendChild(sectionEl);
    });
}

function createMilSymbolSVG(sidc, size = 34) {
    if (typeof ms !== "undefined" && ms.Symbol) {
        return new ms.Symbol(sidc, { size: size }).asSVG();
    }
    // Clean SVG Fallback if library is offline
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 2v20M2 12h20"/></svg>`;
}