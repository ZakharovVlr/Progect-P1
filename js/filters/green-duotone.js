'use strict';
window.Filters = window.Filters || {};

// Фильтр "Дуотон" (зелёный)
Filters['duotone-green'] = function (ctx, image, draw) {
    // 1. Рисуем изображение как есть, без фильтров контекста
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    // 2. Забираем пиксельные данные из области с изображением
    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Яркость пикселя (стандартные коэффициенты восприятия глаза человека)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Коэффициент от 0 (чёрный) до 1 (белый)
        const ratio = gray / 255;

        // Для зелёного дуотона:
        data[i] = 0;           // Красный канал (всегда 0)
        data[i + 1] = 255 * ratio; // Зелёный (от 0 до максимума в зависимости от яркости)
        data[i + 2] = 0;           // Синий канал (всегда 0)
    }

    // 3. Возвращаем изменённые пиксели обратно на canvas
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};
