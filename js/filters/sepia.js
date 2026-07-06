'use strict';

window.Filters = window.Filters || {};

// Фильтр "Сепия" — ручная обработка пикселей по матрице сепии.
// Каждый новый канал — это взвешенная сумма ВСЕХ трёх исходных каналов:
// R' = R*0.393 + G*0.769 + B*0.189
// G' = R*0.349 + G*0.686 + B*0.168
// B' = R*0.272 + G*0.534 + B*0.131
Filters.sepia = function (ctx, image, draw) {
    // 1. Рисуем изображение как есть, без фильтров контекста
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    // 2. Забираем пиксельные данные из области с изображением
    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

    // 3. Проходим по массиву с шагом 4 (на каждый пиксель — 4 значения RGBA)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Вычисляем новые значения по матрице сепии
        const newR = r * 0.393 + g * 0.769 + b * 0.189;
        const newG = r * 0.349 + g * 0.686 + b * 0.168;
        const newB = r * 0.272 + g * 0.534 + b * 0.131;

        // Ограничиваем (clamp) значения диапазоном [0, 255] —
        // формула может дать число больше 255
        data[i] = Math.min(255, newR);
        data[i + 1] = Math.min(255, newG);
        data[i + 2] = Math.min(255, newB);
        // data[i + 3] — альфа-канал, не трогаем
    }

    // 4. Возвращаем изменённые пиксели обратно на canvas
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};