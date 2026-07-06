'use strict';

window.Filters = window.Filters || {};

// Фильтр "Постеризация" — уменьшение количества уровней яркости в каждом канале.
// Вместо 256 плавных градаций остаётся только LEVELS чётких "ступеней",
// из-за чего изображение начинает выглядеть как плакат/постер.
//
// Формула для каждого канала:
// step = 255 / (LEVELS - 1)
// R' = round( round(R / step) * step )
Filters.posterize = function (ctx, image, draw) {
    // Количество уровней яркости на канал. Чем меньше — тем грубее эффект.
    // 4 — заметный "плакатный" эффект, но ещё узнаваемая картинка.
    const LEVELS = 4;
    const step = 255 / (LEVELS - 1);

    // 1. Рисуем изображение как есть, без фильтров контекста
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    // 2. Забираем пиксельные данные из области с изображением
    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

    // 3. Проходим по массиву с шагом 4 (на каждый пиксель — 4 значения RGBA)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(Math.round(data[i] / step) * step);         // R'
        data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step); // G'
        data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step); // B'
        // data[i + 3] — альфа-канал, не трогаем
    }

    // 4. Возвращаем изменённые пиксели обратно на canvas
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};