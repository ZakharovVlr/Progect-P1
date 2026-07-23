'use strict';
window.Filters = window.Filters || {};

Filters['red-splash'] = function (ctx, image, draw) {
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, draw.width, draw.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1. Перевод RGB в точный Hue
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;

        if (d !== 0) {
            if (max === r) { h = (g - b) / d + (g < b ? 6 : 0); }
            else if (max === g) { h = (b - r) / d + 2; }
            else { h = (r - g) / d + 4; }
            h *= 60;
        }

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const saturation = max - min;

        // 2. Настройка диапазонов (до 45 градусов — листва и оранжевая рыбка)
        let colorWeight = 0;
        if (h <= 45) {
            colorWeight = 1 - (h / 45);
        } else if (h >= 300) {
            colorWeight = (h - 300) / (360 - 300);
        }

        // Защита белого фона/глаз и серого цвета.
        // Если каналы почти равны (saturation < 25), это Ч/Б зона, игнорируем её.
        const satWeight = Math.min(1, Math.max(0, (saturation - 25) / 15));
        const mixRatio = colorWeight * satWeight;

        if (mixRatio > 0.05) {
            // 3. Формула инверсии каналов для сочного алого цвета:
            // Вместо жесткого умножения мы отдаем зеленому каналу синий, 
            // а красному — суммарную яркость оригинальных R и G.
            const targetR = Math.min(255, r + g * 0.5);
            const targetG = g * 0.1 + b * 0.4;
            const targetB = b * 0.5;

            // Плавно подмешиваем сочный красный
            data[i] = gray + (targetR - gray) * mixRatio;
            data[i + 1] = gray + (targetG - gray) * mixRatio;
            data[i + 2] = gray + (targetB - gray) * mixRatio;
        } else {
            // Все остальное (серый фон, белки глаз, Биг-Бен) — идеальный Ч/Б
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    ctx.filter = 'none';
    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};
