module.exports = {
    findBestFit: function (w, h, resolutions) {
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
};
