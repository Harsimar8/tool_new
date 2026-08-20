
import "./render.js";


/* =====================================================
   SECTION DROPDOWN
===================================================== */

document.addEventListener("click", event => {

    /* ---------------------------------------------
       SECTION OPEN / CLOSE
    --------------------------------------------- */

    const sectionTitle =
        event.target.closest(".section-title");

    if (sectionTitle) {

        const section =
            sectionTitle.closest(".control-section");

        if (section) {
            section.classList.toggle("open");
        }

        return;
    }


    /* ---------------------------------------------
       TOOL SELECTION
    --------------------------------------------- */

    const button =
        event.target.closest(".tool-button, .mode-button");

    if (!button) return;

    const section =
        button.closest(".control-section");

    if (!section) return;

    /* ---------------------------------------------
   MASK TOGGLE
--------------------------------------------- */

if (button.dataset.toolType === "toggle") {

    const enabled =
        button.dataset.enabled === "true";

    const newState = !enabled;

    button.dataset.enabled =
        newState ? "true" : "false";

    button.classList.toggle(
        "mask-on",
        newState
    );


    const label =
        button.querySelector(".button-label");

    if (label) {

        label.textContent =
            newState
                ? "Mask: ON"
                : "Mask: OFF";

    }


    if (newState) {

        showNotification("Mask: ON");

        setStatus("Mask: ON");

    } else {

        hideNotification();

        setStatus("Mask: OFF");

    }

    return;
}


    const name =
        button.querySelector(".button-label")?.textContent.trim()
        || button.textContent.trim();

        

    const alreadySelected =
        button.classList.contains("selected");


    /* ---------------------------------------------
       REMOVE SELECTION FROM THIS SECTION
    --------------------------------------------- */

    section
        .querySelectorAll(".tool-button.selected, .mode-button.selected")
        .forEach(selectedButton => {
            selectedButton.classList.remove("selected");
        });


    /* ---------------------------------------------
       CLICKING SAME BUTTON = DESELECT
    --------------------------------------------- */

    if (alreadySelected) {

        hideNotification();

        setStatus(
            name + " deselected"
        );

        return;
    }


    /* ---------------------------------------------
       SELECT NEW BUTTON
    --------------------------------------------- */

    button.classList.add("selected");

    showNotification(name);

    setStatus(
        name + " selected"
    );

});


/* =====================================================
   CENTER NOTIFICATION
===================================================== */

function showNotification(name) {

    const notification =
        document.getElementById("toolNotification");

    const text =
        document.getElementById("notificationText");

    if (!notification || !text) return;

    text.textContent = name;

    notification.classList.add("show");
}


/* =====================================================
   HIDE CENTER NOTIFICATION
===================================================== */

function hideNotification() {

    const notification =
        document.getElementById("toolNotification");

    if (!notification) return;

    notification.classList.remove("show");
}


/* =====================================================
   STATUS BAR
===================================================== */

let statusTimer;

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
   NUMBER CONTROLS (+ / −)
===================================================== */

document.addEventListener("click", event => {

    const stepperButton =
        event.target.closest(".mini-stepper button");

    if (!stepperButton) return;

    const control =
        stepperButton.closest(".value-control");

    if (!control) return;

    const valueElement =
        control.querySelector(".value-number");

    if (!valueElement) return;


    let value =
        parseFloat(control.dataset.value) || 0;

    const step =
        parseFloat(control.dataset.step) || 1;

    const unit =
        control.dataset.unit || "";


    if (stepperButton.dataset.action === "increase") {

        value += step;

    }


    if (stepperButton.dataset.action === "decrease") {

        value -= step;

    }


    /* Prevent negative values */

    if (value < 0) {
        value = 0;
    }


    /* Save new value */

    control.dataset.value = value;


    /* Update display */

    valueElement.textContent =
        `${value}${unit}`;

});


/* =====================================================
   SYMBOL CATEGORY SELECTION
===================================================== */

document.addEventListener("click", event => {

    const symbolButton =
        event.target.closest(".symbol-category-button");

    if (!symbolButton) return;


    /* Remove previous selection */

    document
        .querySelectorAll(".symbol-category-button.selected")
        .forEach(button => {

            button.classList.remove("selected");

        });


    /* Select clicked symbol */

    symbolButton.classList.add("selected");


    /* Get symbol information */

    const symbols =
        JSON.parse(
            symbolButton.dataset.symbols || "[]"
        );


    console.log("Selected symbol category:", symbols);


    /* Get displayed name */

    const nameElement =
        symbolButton.querySelector(
            ".symbol-category-name"
        );


    const symbolName =
        nameElement
            ? nameElement.textContent.trim()
            : "Symbol";


    /* Show center status */

    if (typeof setStatus === "function") {

        setStatus(symbolName);

    }

});

