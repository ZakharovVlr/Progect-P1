'use strict';

window.Filters = window.Filters || {};

// Фильтр "Инверсия" — ручная обработка пикселей по формуле негатива.
// Для каждого пикселя: R' = 255 - R, G' = 255 - G, B' = 255 - B, альфа не меняется.
Filters.invert = function (ctx, image, draw) {
    // 1. Сначала рисуем изображение как есть, без фильтров контекста
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    // 2. Забираем пиксельные данные ИМЕННО из области, куда рисовали изображение,
    //    а не всего canvas — так мы не трогаем пустые прозрачные поля вокруг
    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

    // 3. Проходим по массиву с шагом 4, т.к. на каждый пиксель приходится 4 значения (RGBA)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // R' = 255 - R
        data[i + 1] = 255 - data[i + 1]; // G' = 255 - G
        data[i + 2] = 255 - data[i + 2]; // B' = 255 - B
        // data[i + 3] — альфа-канал, оставляем без изменений
    }

    // 4. Возвращаем изменённые пиксели обратно на canvas в то же самое место
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};