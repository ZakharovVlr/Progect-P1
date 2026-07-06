'use strict';

const FilterEngine = (function () {
    const FILTER_MAP = {
        none: Filters.none,
        grayscale: Filters.grayscale,
        invert: Filters.invert,
        sepia: Filters.sepia,
        posterize: Filters.posterize
    };

    function render(ctx, canvas, image, draw, filterName) {
        const applyFn = FILTER_MAP[filterName];

        if (!applyFn) {
            console.warn('Неизвестный фильтр:', filterName);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyFn(ctx, image, draw);
    }

    return { render };
})();