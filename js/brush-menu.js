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
});

    brushSlider.addEventListener('input', () => {
        brushSize.textContent = brushSlider.value;
        drawBrushPreview();
});


    function drawBrushPreview() {
        let x = 90;
        let y = 90;
        let radius = brushSlider.value / 2;
        let width;
        let height;
        ctx.clearRect(0, 0, brushPreviewCanvas.width, brushPreviewCanvas.height);
        ctx.beginPath(); // начинаем новый путь рисования
        ctx.arc(x, y, radius, 0, Math.PI * 2); // рисуем окружность: центр (x,y), радиус, от 0 до полного круга
        ctx.fillStyle = '#2600FF'; // цвет заливки
        ctx.fill(); // заливаем нарисованный контур

    }

});