
import ms from "milsymbol";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Initialize OpenStreetMap behind the toolbar
        const map = L.map('map', { zoomControl: false }).setView([30.9010, 75.8573], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        window.tacticalMap = map;

        // 2. Load Tools and Render UI
        const response = await fetch("tools.json");
        const data = await response.json();
        window.terrainToolData = data;
        
        renderHeader(data.panel);
        renderRail(data.sections);
        renderSections(data.sections);

        const defaultSection = data.sections.find(s => s.id === "symbols") || data.sections[0];
        if (defaultSection) {
            window.switchSection(defaultSection.id, document.querySelector(`.rail-btn[data-id="${defaultSection.id}"]`));
        }

        // 3. ATTACH DRAGGING LOGIC HERE (Now that header exists in DOM)
        const dock = document.querySelector(".tactical-menu-dock");
        const header = document.querySelector(".panel-header");

        if (dock && header) {
            let isDragging = false;
            let startX, startY, initialLeft, initialTop;

            header.style.cursor = "move";

            header.addEventListener("mousedown", (e) => {
                if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                const rect = dock.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;

                dock.style.position = "fixed";
                dock.style.left = `${initialLeft}px`;
                dock.style.top = `${initialTop}px`;

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            function onMouseMove(e) {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                dock.style.left = `${initialLeft + dx}px`;
                dock.style.top = `${initialTop + dy}px`;
            }

            function onMouseUp() {
                isDragging = false;
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        }

    } catch (error) {
        console.error("Failed to load tools.json or initialize map:", error);
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

function renderSections(sections) {
    const container = document.getElementById("dynamicPanelContent");
    if (!container) return;
    container.innerHTML = "";

    sections.forEach(section => {
        const sectionEl = document.createElement("div");
        sectionEl.id = `section-${section.id}`;
        sectionEl.className = "drawer-section";
        sectionEl.style.display = "none";

        // Section Title without any item count badge
        let html = `
            <div class="drawer-section-header">
                <div class="drawer-section-title">
                    <span class="sec-icon">${section.icon}</span>
                    <span>${section.title}</span>
                </div>
            </div>
        `;

        // 1. SYMBOLS SECTION
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
                    html += `<button class="filter-pill" onclick="filterCategory('${cat.id}', this)">${cat.label.toUpperCase()}</button>`;
                    cat.symbols.forEach(sym => {
                        allSymbols.push({ ...sym, categoryId: cat.id, categoryLabel: cat.label });
                    });
                }
            });

            html += `</div><div class="symbol-card-grid">`;

            allSymbols.forEach(sym => {
                const svgIcon = createMilSymbolSVG(sym.sidc, 34);
                html += `
                    <div class="tactical-symbol-card" data-category="${sym.categoryId}" data-name="${sym.name}" onclick="selectSymbolCard(this, '${sym.name}', '${sym.sidc}')">
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

            html += `</div>`;
        } 
        
        // 2. OTHER SECTIONS (Buttons, Sliders & Toggles)
        else {
            let buttonGridActive = false;

            section.items.forEach((item, index) => {
                const isWide = item.wide ? " wide" : "";

                // A. BUTTONS & MODES
                if (item.type === "button" || item.type === "mode") {
                    if (!buttonGridActive) {
                        html += `<div class="button-grid">`;
                        buttonGridActive = true;
                    }

                    const isReset = (item.id || "").toLowerCase().includes("reset") || (item.label || "").toLowerCase().includes("reset");
                    const dangerClass = isReset ? " danger-action" : "";

                    const isAction = (item.id || "").includes("undo") || (item.id || "").includes("redo") || isReset;
                    const clickAction = isAction 
                        ? `performAction('${item.id || item.label}', '${item.label}')` 
                        : `selectOption(this, '${item.id}', '${item.label}')`;

                    html += `
                        <button class="tool-button${isWide}${dangerClass}" onclick="${clickAction}">
                            <span class="button-icon">${item.icon || "◈"}</span>
                            <span>${item.label}</span>
                        </button>
                    `;
                } 
                // B. TOGGLES (e.g. MASK: ON / OFF)
                else if (item.type === "toggle") {
                    if (buttonGridActive) {
                        html += `</div>`;
                        buttonGridActive = false;
                    }

                    html += `
                        <button id="${item.id}Button" class="tactical-toggle-btn${isWide}" 
                            data-enabled="${item.value}" 
                            onclick="toggleMaskSetting(this, '${item.id}', '${item.onLabel || item.label + ': ON'}', '${item.offLabel || item.label + ': OFF'}')">
                            <span class="toggle-text">${item.value ? (item.onLabel || item.label + ': ON') : (item.offLabel || item.label + ': OFF')}</span>
                            <div class="toggle-indicator"></div>
                        </button>
                    `;
                }
                // C. NUMERIC VALUES -> GRADIENT TELEMETRY SLIDERS
                else if (item.type === "number") {
                    if (buttonGridActive) {
                        html += `</div>`;
                        buttonGridActive = false;
                    }

                    let minVal = 0;
                    let maxVal = item.id === "radius" ? 5000 : item.id === "power" ? 50 : item.id === "maxHeight" ? 2000 : 1000;
                    if (item.id === "radius") minVal = 100;

                    html += `
                        <div class="slider-control-card">
                            <div class="slider-top-row">
                                <span class="slider-label">${item.label}</span>
                                <span class="slider-number" id="${item.id}Value">${item.value} ${item.unit || ""}</span>
                            </div>
                            <div class="slider-bottom-row">
                                <button class="mini-stepper-btn" onclick="stepValue('${item.id}', -${item.step || 1}, '${item.unit || ""}')">−</button>
                                <input type="range" class="cyber-range-input" id="${item.id}Slider" 
                                    min="${minVal}" max="${maxVal}" step="${item.step || 1}" value="${item.value}" 
                                    oninput="sliderChange('${item.id}', this.value, '${item.unit || ""}')">
                                <button class="mini-stepper-btn" onclick="stepValue('${item.id}', ${item.step || 1}, '${item.unit || ""}')">+</button>
                            </div>
                        </div>
                    `;
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
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 2v20M2 12h20"/></svg>`;
}y