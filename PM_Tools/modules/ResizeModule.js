module.exports = {
    execute: async function (doc, bestFit) {
        try {
            const cw = doc.width;
            const ch = doc.height;

            // Logic: Scale to Cover
            const scaleW = bestFit.w / cw;
            const scaleH = bestFit.h / ch;
            const scaleFactor = Math.max(scaleW, scaleH);

            const newW = Math.round(cw * scaleFactor);
            const newH = Math.round(ch * scaleFactor);

            // Execute Resize
            await doc.resizeImage(newW, newH);

            return true;
        } catch (e) {
            console.error("Resize Failed: " + e.message);
            return false;
        }
    }
};
