'use strict';

window.Filters = window.Filters || {};

// Фильтр "Дуотон" — заменяет яркость каждого пикселя на градиент
// между двумя выбранными цветами: тёмный оттенок для теней, светлый для светов.
//
// 1. Считаем яркость пикселя (gray) по стандартной формуле восприятия яркости человеком
// 2. Переводим её в коэффициент ratio от 0 (чёрный) до 1 (белый)
// 3. Линейно интерполируем между цветом теней и цветом светов по этому коэффициенту:
//    R' = shadowR + (highlightR - shadowR) * ratio  (аналогично для G и B)
Filters.duotone = function (ctx, image, draw) {
    // Цвет теней (тёмные участки) и цвет светов (светлые участки).
    // Поменяйте эти значения, чтобы получить другую пару оттенков.
    const SHADOW_COLOR = { r: 44, g: 12, b: 92 };    // тёмно-фиолетовый
    const HIGHLIGHT_COLOR = { r: 255, g: 204, b: 0 }; // жёлтый

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

        data[i] = 255;
        data[i + 1] = 255 * ratio;
        data[i + 2] = 0;
    }

    // 3. Возвращаем изменённые пиксели обратно на canvas
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};