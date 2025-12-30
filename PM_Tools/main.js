const { entrypoints } = require("uxp");
const { app, core, action } = require("photoshop");

console.log("PM Tools: Plugin Initializing...");

// Load Core
const Config = require("./core/Config.js");
const Utils = require("./core/Utils.js");

// Modules
const ResizeModule = require("./modules/ResizeModule.js");
const CropModule = require("./modules/CropModule.js");

let currentBestFit = null;
let lblName, lblSize, btnRefresh, btnResize, btnCrop;

/**
 * Image analysis logic
 */
async function analyze() {
  try {
    const doc = app.activeDocument;
    if (!doc) {
      if (lblName) lblName.textContent = "No Document";
      if (lblSize) lblSize.textContent = "Please open an image";
      currentBestFit = null;
      if (btnResize) btnResize.disabled = true;
      if (btnCrop) btnCrop.disabled = true;
      return;
    }

    const docW = doc.width;
    const docH = doc.height;

    currentBestFit = Utils.findBestFit(docW, docH, Config.RESOLUTIONS);

    // Update UI
    if (lblName) lblName.textContent = currentBestFit.name;
    if (lblSize) lblSize.textContent = `${currentBestFit.w} x ${currentBestFit.h} px`;

    if (btnResize) btnResize.disabled = false;
    if (btnCrop) btnCrop.disabled = false;

  } catch (e) {
    console.error("PM Tools: Analysis Error:", e);
  }
}

/**
 * Initialize the UI and event listeners
 */
function init() {
  console.log("PM Tools: UI and Listeners Initializing...");
  lblName = document.getElementById("res-name");
  lblSize = document.getElementById("res-size");
  btnRefresh = document.getElementById("btn-refresh");
  btnResize = document.getElementById("btn-resize");
  btnCrop = document.getElementById("btn-crop");

  if (btnRefresh) {
    btnRefresh.addEventListener("click", analyze);
  }

  if (btnResize) {
    btnResize.addEventListener("click", async () => {
      console.log("PM Tools: Clicked Resize");
      if (!currentBestFit) await analyze();
      if (!currentBestFit || !app.activeDocument) return;
      try {
        await core.executeAsModal(async () => {
          await ResizeModule.execute(app.activeDocument, currentBestFit);
        }, { "commandName": "Smart Resize" });
      } catch (err) {
        console.error("PM Tools: Resize execution failed", err);
      }
    });
  }

  if (btnCrop) {
    btnCrop.addEventListener("click", async () => {
      console.log("PM Tools: Clicked Crop");
      if (!currentBestFit) await analyze();
      if (!currentBestFit || !app.activeDocument) return;
      try {
        await core.executeAsModal(async () => {
          await CropModule.execute(app.activeDocument, currentBestFit);
        }, { "commandName": "Activate Crop" });
      } catch (err) {
        console.error("PM Tools: Crop execution failed", err);
      }
    });
  }

  action.addNotificationListener([
    { event: "open" },
    { event: "make" },
    { event: "select" }
  ], () => {
    setTimeout(analyze, 200);
  });

  analyze();
}

// UXP Entrypoints
entrypoints.setup({
  panels: {
    vanilla: {
      show(node) {
        init();
      }
    }
  }
});