const { action } = require("photoshop");

module.exports = {
    execute: async function (doc, bestFit) {
        console.log("PM Tools: Reverting to stable Ratio + Selection Crop...");
        try {
            const rw = bestFit.w;
            const rh = bestFit.h;
            const cw = doc.width;
            const ch = doc.height;

            const cx = cw / 2;
            const cy = ch / 2;

            const top = Math.round(cy - (rh / 2));
            const left = Math.round(cx - (rw / 2));
            const bottom = Math.round(cy + (rh / 2));
            const right = Math.round(cx + (rw / 2));

            // 1. Set the Crop Tool's Ratio fields
            await action.batchPlay([
                {
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "tool",
                            "_enum": "ordinal",
                            "_value": "targetEnum"
                        }
                    ],
                    "to": {
                        "_obj": "targetEnum",
                        "aspectRatioMode": {
                            "_enum": "aspectRatioMode",
                            "_value": "ratio"
                        },
                        "width": rw,
                        "height": rh
                    },
                    "_isCommand": true
                }
            ], {});

            // 2. Create the selection and THEN switch tool
            // We keep the selection active as it's the only stable way to keep handles in place
            await action.batchPlay([
                {
                    "_obj": "set",
                    "_target": [
                        {
                            "_ref": "channel",
                            "_property": "selection"
                        }
                    ],
                    "to": {
                        "_obj": "rectangle",
                        "top": { "_unit": "pixelsUnit", "_value": top },
                        "left": { "_unit": "pixelsUnit", "_value": left },
                        "bottom": { "_unit": "pixelsUnit", "_value": bottom },
                        "right": { "_unit": "pixelsUnit", "_value": right }
                    },
                    "_isCommand": true
                },
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "cropTool"
                        }
                    ],
                    "_isCommand": true
                }
            ], {});

            console.log("PM Tools: Reverted to stable version with active handles.");
            return true;
        } catch (e) {
            console.error("PM Tools: Crop Revert Error:", e);
            return false;
        }
    }
};
