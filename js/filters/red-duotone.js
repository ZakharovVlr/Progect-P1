'use strict';
window.Filters = window.Filters || {};

Filters['duotone-red'] = function (ctx, image, draw) {
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1. Получаем чистую яркость пикселя (от 0 до 255)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2. Рассчитываем коэффициент перехода в белый цвет (от 0 до 1)
        // Начинаем подмешивать белый цвет только там, где яркость выше 160 единиц
        const whiteStart = 160;
        const t = Math.max(0, (gray - whiteStart) / (255 - whiteStart));

        // 3. Формула плавного градиента: 
        // В темноте и средних тонах (t = 0) -> чистый красный дуотон (gray, 0, 0)
        // В самых ярких тонах (t = 1) -> чистый белый цвет (255, 255, 255)
        data[i] = gray + (255 - gray) * t; // Плавно переходит от gray к 255
        data[i + 1] = 0 + 255 * t;        // Плавно переходит от 0 к 255
        data[i + 2] = 0 + 255 * t;        // Плавно переходит от 0 к 255
    }

    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};
