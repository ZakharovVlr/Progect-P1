'use strict';

// Лоадер обработки фильтра.
// Требования:
//  - показывается минимум MIN_DISPLAY_MS;
//  - показывается на всё время реальной обработки, если она дольше MIN_DISPLAY_MS;
//  - тёмный оверлей строго над областью фото (canvas), а не над всей страницей;
//  - белый текст "Обработка...", анимация точек.
window.Loader = (function () {
    const MIN_DISPLAY_MS = 500;

    let overlayEl = null;
    let showStartTime = 0;

    function ensureOverlay() {
        if (overlayEl) {
            return overlayEl;
        }

        overlayEl = document.createElement('div');
        overlayEl.className = 'filter-loader-overlay';
        overlayEl.innerHTML =
            '<div class="filter-loader-text">' +
            '<span class="filter-loader-word">Обработка</span>' +
            '<span class="filter-loader-dots"><span></span><span></span><span></span></span>' +
            '</div>';

        // Добавляем в body и позиционируем fixed по координатам canvas —
        // так оверлей ложится ровно на область фото независимо от того,
        // как устроена вёрстка вокруг (отступы, кнопки undo/redo и т.п.),
        // и не требует position: relative на родителях.
        document.body.appendChild(overlayEl);
        return overlayEl;
    }

    // Пересчитывает положение и размер оверлея строго по canvas
    function syncPosition(targetEl) {
        const rect = targetEl.getBoundingClientRect();
        overlayEl.style.top = rect.top + 'px';
        overlayEl.style.left = rect.left + 'px';
        overlayEl.style.width = rect.width + 'px';
        overlayEl.style.height = rect.height + 'px';
    }

    function show(targetEl) {
        ensureOverlay();
        syncPosition(targetEl);
        overlayEl.classList.add('is-visible');
        showStartTime = performance.now();
    }

    function hide() {
        if (!overlayEl) {
            return Promise.resolve();
        }

        const elapsed = performance.now() - showStartTime;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

        return new Promise((resolve) => {
            setTimeout(() => {
                overlayEl.classList.remove('is-visible');
                resolve();
            }, remaining);
        });
    }

    // Оборачивает синхронную (блокирующую) обработку фильтра:
    //  1. показывает лоадер точно над targetEl (обычно это сам canvas);
    //  2. ждёт, пока браузер реально отрисует его на экране
    //     (двойной requestAnimationFrame — иначе синхронный heavyFn
    //     заблокирует поток раньше, чем оверлей успеет появиться);
    //  3. выполняет тяжёлую функцию;
    //  4. держит лоадер минимум MIN_DISPLAY_MS суммарно, даже если
    //     обработка заняла меньше этого времени.
    async function wrap(targetEl, heavyFn) {
        show(targetEl);

        await new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });

        try {
            heavyFn();
        } finally {
            await hide();
        }
    }

    return { show, hide, wrap };
})();