'use strict';

// Общий неймспейс для всех фильтров
window.Filters = window.Filters || {};

Filters.none = function (ctx, image, draw) {
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);
    ctx.filter = 'none';
};