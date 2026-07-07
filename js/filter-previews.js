'use strict';

// Отдельный модуль, отвечающий только за генерацию превью на кнопках фильтров.
// main.js ничего не знает о том, КАК устроены превью — он просто вызывает
// FilterPreviews.generate(...) после загрузки фото.
window.FilterPreviews = (function () {
    const THUMB_SIZE = 96;

    // Собственный canvas "за кадром", используется только этим модулем
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = THUMB_SIZE;
    thumbCanvas.height = THUMB_SIZE;
    const thumbCtx = thumbCanvas.getContext('2d');

    // Прогоняет image через каждый фильтр из filterButtons и вставляет
    // результат как background-image в дочерний элемент .filter-btn__thumb
    function generate(image, filterButtons) {
        if (!image || !thumbCtx || !filterButtons || !filterButtons.length) return;

        const scale = Math.min(
            THUMB_SIZE / image.width,
            THUMB_SIZE / image.height
        );
        const w = image.width * scale;
        const h = image.height * scale;
        const thumbDraw = {
            offsetX: (THUMB_SIZE - w) / 2,
            offsetY: (THUMB_SIZE - h) / 2,
            width: w,
            height: h
        };

        filterButtons.forEach((btn) => {
            const filterName = btn.dataset.filter;
            const thumbEl = btn.querySelector('.filter-btn__thumb');
            if (!thumbEl) return;

            FilterEngine.render(thumbCtx, thumbCanvas, image, thumbDraw, filterName);
            thumbEl.style.backgroundImage = `url(${thumbCanvas.toDataURL('image/jpeg', 0.85)})`;
        });
    }

    return { generate };
})();