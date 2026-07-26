document.addEventListener('DOMContentLoaded', function () {
    const toolbarsWrapper = document.getElementById('toolbarsWrapper');
    const brush = document.getElementById('btn-brush');
    const brushMenu = document.getElementById('brushMenu'); 
    const brushSlider = document.getElementById('brushSizeSlider');
    const brushSize = document.getElementById('brushSizeValue');
    const brushPreviewCanvas = document.getElementById('brushPreviewCanvas');
    const ctx = brushPreviewCanvas.getContext('2d');
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

    function resizeBrushCanvas() {
        const rect = brushPreviewCanvas.parentElement.getBoundingClientRect();
        brushPreviewCanvas.width = rect.width;
        brushPreviewCanvas.height = rect.height;
    }

    
    drawBrushPreview();

    function drawBrushPreview() {
        let x = brushPreviewCanvas.width / 2;
        let y = brushPreviewCanvas.height / 2;
        let radius = brushSlider.value / 2;
        ctx.clearRect(0, 0, brushPreviewCanvas.width, brushPreviewCanvas.height);
        ctx.beginPath(); // начинаем новый путь рисования
        ctx.arc(x, y, radius, 0, Math.PI * 2); // рисуем окружность: центр (x,y), радиус, от 0 до полного круга
        ctx.fillStyle = '#2600FF'; // цвет заливки
        ctx.fill(); // заливаем нарисованный контур
    }
    
    window.addEventListener('resize', () => {
        if (!brushMenu.classList.contains('is-hidden')) { // пересчитываем, только если меню видимо
            resizeBrushCanvas();
            drawBrushPreview();
        }
    });

    
    
});