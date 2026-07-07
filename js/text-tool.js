'use strict';

window.TextTool = (function () {
    let canvas = null;
    let ctx = null;
    let onCommit = null;

    // Ссылки на элементы интерфейса меню текста
    let textMenu = null;
    let textMenuClose = null;
    let fontSelect = null;
    let sizeInput = null;
    let colorInput = null;

    let textLayer = null;
    let baseSnapshot = null;

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Инициализация модуля
    function init(canvasEl, ctxEl, onCommitCallback) {
        canvas = canvasEl;
        ctx = ctxEl;
        onCommit = onCommitCallback;

        // Поиск элементов управления в HTML
        textMenu = document.getElementById('textMenu');
        textMenuClose = document.getElementById('textMenuClose');
        fontSelect = document.getElementById('fontSelect');
        sizeInput = document.getElementById('sizeInput');
        colorInput = document.getElementById('colorInput');

        // Слушатели для холста (перетаскивание)
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerUp);

        // Слушатели для элементов меню
        if (textMenuClose) {
            textMenuClose.addEventListener('click', closeMenu);
        }
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => setFont(e.target.value));
        }
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => setSize(parseInt(e.target.value, 10) || 32));
        }
        if (colorInput) {
            colorInput.addEventListener('input', (e) => setColor(e.target.value));
        }
    }

    // Открытие меню текста из main.js
    function openMenu(toolbarsWrapper, textButton, hasPhoto) {
        if (!hasPhoto || !textMenu) return;

        toolbarsWrapper.classList.add('is-hidden');
        textMenu.classList.remove('is-hidden');
        if (textButton) textButton.setAttribute('aria-expanded', 'true');

        if (!textLayer) {
            const currentBaseSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            addDefaultText(currentBaseSnapshot);

            if (fontSelect) fontSelect.value = 'Noto Serif';
            if (sizeInput) sizeInput.value = 32;
            if (colorInput) colorInput.value = '#000000';
        }
    }

    // Закрытие меню текста
    function closeMenu() {
        if (!textMenu) return;
        textMenu.classList.add('is-hidden');

        const toolbarsWrapper = document.getElementById('toolbarsWrapper');
        const textButton = document.querySelector('#btn-add-text');

        if (toolbarsWrapper) toolbarsWrapper.classList.remove('is-hidden');
        if (textButton) textButton.setAttribute('aria-expanded', 'false');

        // === ДОБАВЛЯЕМ СЮДА ЭТИ ДВЕ СТРОЧКИ ===
        if (onCommit) onCommit(); // Фиксируем финальный текст в истории main.js при выходе
        reset();                  // Полностью сбрасываем инструмент для следующего раза
    }

    function getCanvasCoords(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function drawText() {
        if (!textLayer) return;
        ctx.font = `${textLayer.size}px ${textLayer.font}`;
        ctx.fillStyle = textLayer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textLayer.content, textLayer.x, textLayer.y);
    }

    function redraw() {
        if (!baseSnapshot) return;
        ctx.putImageData(baseSnapshot, 0, 0);
        drawText();
    }

    function hitTestText(x, y) {
        if (!textLayer) return false;

        ctx.font = `${textLayer.size}px ${textLayer.font}`;
        const metrics = ctx.measureText(textLayer.content);
        const halfWidth = metrics.width / 2;
        const halfHeight = textLayer.size / 2;

        return (
            x >= textLayer.x - halfWidth && x <= textLayer.x + halfWidth &&
            y >= textLayer.y - halfHeight && y <= textLayer.y + halfHeight
        );
    }
    // Вместо dragOffsetX/Y заводим переменные для хранения ПРЕДЫДУЩЕЙ позиции курсора
    let lastPointerX = 0;
    let lastPointerY = 0;

    function handlePointerDown(event) {
        if (!textLayer) return;

        const { x, y } = getCanvasCoords(event);
        if (!hitTestText(x, y)) return; // Кликнули мимо текста — игнорируем

        isDragging = true;

        // Запоминаем, где именно БЫЛ курсор в момент нажатия
        lastPointerX = x;
        lastPointerY = y;

        canvas.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event) {
        if (!isDragging) return;

        const { x, y } = getCanvasCoords(event);

        // Вычисляем, на сколько пикселей сместился курсор с прошлого кадра
        const deltaX = x - lastPointerX;
        const deltaY = y - lastPointerY;

        // Сдвигаем текст ровно на эту разницу
        textLayer.x += deltaX;
        textLayer.y += deltaY;

        // Запоминаем текущую позицию как стартовую для следующего кадра движения
        lastPointerX = x;
        lastPointerY = y;

        redraw();
    }

    function handlePointerUp(event) {
        if (!isDragging) return;

        isDragging = false;
        canvas.releasePointerCapture(event.pointerId);

        if (onCommit) onCommit();
    }


    // Изменяем: сохраняем базу только ОДИН раз, при создании текста
    function addDefaultText(currentBase) {
        if (!baseSnapshot) {
            baseSnapshot = currentBase;
        }

        textLayer = {
            content: 'Ваш текст',
            font: 'Noto Serif',
            size: 32,
            color: '#000000',
            x: canvas.width / 2,
            y: canvas.height / 2
        };

        redraw();
        // Убрали отсюда onCommit(), чтобы не ломать историю при первом появлении
    }

    function setFont(fontFamily) {
        if (!textLayer) return;
        textLayer.font = fontFamily;
        redraw();
    }

    function setSize(size) {
        if (!textLayer) return;
        textLayer.size = size;
        redraw();
    }

    function setColor(color) {
        if (!textLayer) return;
        textLayer.color = color;
        redraw();
    }


    function hasText() {
        return !!textLayer;
    }

    function reset() {
        textLayer = null;
        baseSnapshot = null; // Очищаем снимок фона, чтобы при следующем открытии сделать новый
        isDragging = false;
    }

    return { init, openMenu, addDefaultText, setFont, setSize, setColor, hasText, reset };
})();
