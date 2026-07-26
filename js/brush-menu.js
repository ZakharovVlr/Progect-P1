'use strict';

// Общее хранилище настроек кисти — читается из main.js при рисовании,
// чтобы не тащить туда напрямую внутренности меню кисти.
window.BrushSettings = window.BrushSettings || { color: '#2600FF' };

document.addEventListener('DOMContentLoaded', function () {
    const toolbarsWrapper = document.getElementById('toolbarsWrapper');
    const brush = document.getElementById('btn-brush');
    const brushMenu = document.getElementById('brushMenu');
    const brushSlider = document.getElementById('brushSizeSlider');
    const brushSize = document.getElementById('brushSizeValue');
    const brushPreviewCanvas = document.getElementById('brushPreviewCanvas');
    const ctx = brushPreviewCanvas.getContext('2d');

    const brushColorPicker = document.getElementById('brushColorPicker');
    const brushColorSwatch = document.getElementById('brushColorSwatch');
    const brushColorHex = document.getElementById('brushColorHex');

    // и логику открытия/закрытия меню
    brush.addEventListener('click', () => {
        toolbarsWrapper.classList.add('is-hidden');
        brushMenu.classList.toggle('is-hidden');
        brush.setAttribute('aria-expanded', 'true');

        resizeBrushCanvas(); // ← добавляем сюда
        drawBrushPreview();  // ← и сюда, вместо/в дополнение к вызову при загрузке
    });


    brushSlider.addEventListener('input', () => {
        brushSize.textContent = brushSlider.value;
        drawBrushPreview();
    });

    // Меняем цвет кисти: обновляем свотч, текст hex-кода и общее хранилище,
    // которое читает main.js при рисовании на основном canvas.
    brushColorPicker.addEventListener('input', () => {
        applyBrushColor(brushColorPicker.value);
    });

    function applyBrushColor(hexColor) {
        window.BrushSettings.color = hexColor;

        brushColorSwatch.style.backgroundColor = hexColor;
        // Убираем "#" и приводим к верхнему регистру — под формат,
        // который уже используется в разметке ("2600FF", а не "#2600ff").
        brushColorHex.textContent = hexColor.replace('#', '').toUpperCase();

        drawBrushPreview();
    }

    function resizeBrushCanvas() {
        const rect = brushPreviewCanvas.parentElement.getBoundingClientRect();
        brushPreviewCanvas.width = rect.width;
        brushPreviewCanvas.height = rect.height;
    }


    function drawBrushPreview() {
        let x = brushPreviewCanvas.width / 2;
        let y = brushPreviewCanvas.height / 2;
        let radius = brushSlider.value / 2;
        ctx.clearRect(0, 0, brushPreviewCanvas.width, brushPreviewCanvas.height);
        ctx.beginPath(); // начинаем новый путь рисования
        ctx.arc(x, y, radius, 0, Math.PI * 2); // рисуем окружность: центр (x,y), радиус, от 0 до полного круга
        ctx.fillStyle = window.BrushSettings.color; // цвет заливки — берём из общих настроек кисти
        ctx.fill(); // заливаем нарисованный контур
    }

    // Синхронизируем начальное состояние: свотч/текст должны совпадать
    // со значением color picker'а при первой загрузке страницы,
    // а не только после первого выбора цвета пользователем.
    applyBrushColor(brushColorPicker.value);

    window.addEventListener('resize', () => {
        if (!brushMenu.classList.contains('is-hidden')) { // пересчитываем, только если меню видимо
            resizeBrushCanvas();
            drawBrushPreview();
        }
    });


});