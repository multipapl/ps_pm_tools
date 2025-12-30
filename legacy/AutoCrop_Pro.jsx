app.bringToFront();

/**
 * AutoCrop Pro
 * 
 * Workflow:
 * 1. Analyze current image aspect ratio.
 * 2. Find closest standard resolution (1K/2K/4K).
 * 3. Provide UI to:
 *    - Resize image to cover target resolution (Scale First).
 *    - Initialize Crop Tool with correct selection.
 */

(function main() {
    // --- CONFIGURATION: RESOLUTION TABLE ---
    var RESOLUTIONS = [
        // 1K
        { w: 1376, h: 768, name: "1K 16:9" }, { w: 1024, h: 1024, name: "1K 1:1" }, { w: 1584, h: 672, name: "1K 21:9" },
        { w: 848, h: 1264, name: "1K 2:3" }, { w: 1264, h: 848, name: "1K 3:2" }, { w: 896, h: 1200, name: "1K 3:4" },
        { w: 1200, h: 896, name: "1K 4:3" }, { w: 928, h: 1152, name: "1K 4:5" }, { w: 1152, h: 928, name: "1K 5:4" },
        { w: 768, h: 1376, name: "1K 9:16" },
        // 2K
        { w: 2752, h: 1536, name: "2K 16:9" }, { w: 2048, h: 2048, name: "2K 1:1" }, { w: 3168, h: 1344, name: "2K 21:9" },
        { w: 1696, h: 2528, name: "2K 2:3" }, { w: 2528, h: 1696, name: "2K 3:2" }, { w: 1792, h: 2400, name: "2K 3:4" },
        { w: 2400, h: 1792, name: "2K 4:3" }, { w: 1856, h: 2304, name: "2K 4:5" }, { w: 2304, h: 1856, name: "2K 5:4" },
        { w: 1536, h: 2752, name: "2K 9:16" },
        // 4K
        { w: 5504, h: 3072, name: "4K 16:9" }, { w: 4096, h: 4096, name: "4K 1:1" }, { w: 6336, h: 2688, name: "4K 21:9" },
        { w: 3392, h: 5056, name: "4K 2:3" }, { w: 5056, h: 3392, name: "4K 3:2" }, { w: 3584, h: 4800, name: "4K 3:4" },
        { w: 4800, h: 3584, name: "4K 4:3" }, { w: 3712, h: 4608, name: "4K 4:5" }, { w: 4608, h: 3712, name: "4K 5:4" },
        { w: 3072, h: 5504, name: "4K 9:16" }
    ];

    // --- VALIDATION ---
    if (app.documents.length === 0) {
        alert("No active document found.\nPlease open an image.");
        return;
    }

    try {
        var doc = app.activeDocument;
        var docW = doc.width.as("px");
        var docH = doc.height.as("px");

        // --- ANALYSIS ---
        // Find best resolution match
        var bestFit = findBestFit(docW, docH, RESOLUTIONS);

        // --- UI CONSTRUCTION ---
        var win = new Window("dialog", "AutoCrop Pro");
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 20;

        // Header Panel
        var pnlInfo = win.add("panel", undefined, "Target Resolution");
        pnlInfo.orientation = "column";
        pnlInfo.alignChildren = ["center", "center"];

        var fontBig = ScriptUI.newFont("dialog", "BOLD", 18);
        var lblName = pnlInfo.add("statictext", undefined, bestFit.name);
        lblName.graphics.font = fontBig;

        var lblSize = pnlInfo.add("statictext", undefined, bestFit.w + " x " + bestFit.h + " px");

        // Action Group
        win.add("statictext", undefined, "Workflow Steps:");

        // Button 1: Resize
        var grpResize = win.add("group");
        grpResize.orientation = "row";
        var btnResize = grpResize.add("button", undefined, "1. Smart Resize");
        btnResize.helpTip = "Scales image to cover the target resolution completely.";
        btnResize.preferredSize.width = 200;

        // Button 2: Crop
        var grpCrop = win.add("group");
        grpCrop.orientation = "row";
        var btnCrop = grpCrop.add("button", undefined, "2. Activate Crop");
        btnCrop.helpTip = "Selects the crop area and activates Crop Tool.";
        btnCrop.preferredSize.width = 200;

        var sep = win.add("panel", undefined, undefined);
        sep.alignment = "fill";

        var btnClose = win.add("button", undefined, "Close");

        // --- EVENT HANDLERS ---

        btnResize.onClick = function () {
            try {
                // Refresh dimensions
                var d = app.activeDocument;
                var cw = d.width.as("px");
                var ch = d.height.as("px");

                // Logic: Scale to Cover (Preserve Aspect Ratio)
                // We need to match the SHORTER side relative to target
                // Or rather: Ensure BOTH sides use the LARGER scale factor required to fill
                var scaleW = bestFit.w / cw;
                var scaleH = bestFit.h / ch;
                var scaleFactor = Math.max(scaleW, scaleH);

                var newW = cw * scaleFactor;
                var newH = ch * scaleFactor;

                // Execute Resize
                d.resizeImage(UnitValue(newW, "px"), UnitValue(newH, "px"), null, ResampleMethod.BICUBIC);

                // Visual feedback only works if dialog closes or we force update
                app.refresh();

            } catch (e) {
                alert("Resize Failed: " + e.message);
            }
        };

        btnCrop.onClick = function () {
            try {
                var d = app.activeDocument;
                var cw = d.width.as("px");
                var ch = d.height.as("px");

                // Calculate centered crop box for Target Resolution
                var rw = bestFit.w;
                var rh = bestFit.h;

                var cx = cw / 2;
                var cy = ch / 2;

                var top = cy - (rh / 2);
                var left = cx - (rw / 2);
                var bottom = cy + (rh / 2);
                var right = cx + (rw / 2);

                // Create Selection
                var region = [
                    [left, top],
                    [right, top],
                    [right, bottom],
                    [left, bottom]
                ];

                d.selection.select(region);

                // Activate Crop Tool
                app.currentTool = "cropTool";

                // Close dialog to allow user interaction
                win.close();

            } catch (e) {
                alert("Crop Activation Failed: " + e.message);
            }
        };

        btnClose.onClick = function () {
            win.close();
        };

        // --- SHOW UI ---
        win.center();
        win.show();

    } catch (err) {
        alert("Critical Error:\n" + err.line + ": " + err.message);
    }
})();

// --- HELPER LOGIC ---

function findBestFit(w, h, resolutions) {
    var docRatio = w / h;
    var bestMatch = resolutions[0];
    var minDiff = 99999;

    // 1. Find best aspect ratio match
    for (var i = 0; i < resolutions.length; i++) {
        var r = resolutions[i];
        var rRatio = r.w / r.h;
        var diff = Math.abs(docRatio - rRatio);

        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = r;
        } else if (Math.abs(diff - minDiff) < 0.001) {
            // Tie-breaker: Pick the one closer in physical width
            if (Math.abs(w - r.w) < Math.abs(w - bestMatch.w)) {
                bestMatch = r;
            }
        }
    }

    // 2. Refine: Find best size match within that aspect ratio
    // (e.g. if we matched 16:9, decide between 1K, 2K, 4K)
    var targetRatio = bestMatch.w / bestMatch.h;
    var candidates = [];

    for (var j = 0; j < resolutions.length; j++) {
        var r = resolutions[j];
        if (Math.abs((r.w / r.h) - targetRatio) < 0.01) {
            candidates.push(r);
        }
    }

    // Find candidate closest in Area (Pixel Count)
    var currentArea = w * h;
    var finalBest = candidates[0];
    var minAreaDiff = Math.abs(currentArea - (finalBest.w * finalBest.h));

    for (var k = 1; k < candidates.length; k++) {
        var cand = candidates[k];
        var area = cand.w * cand.h;
        var diff = Math.abs(currentArea - area);

        if (diff < minAreaDiff) {
            minAreaDiff = diff;
            finalBest = cand;
        }
    }

    return finalBest;
}
