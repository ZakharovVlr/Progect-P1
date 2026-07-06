'use strict';

window.Filters = window.Filters || {};

Filters.grayscale = function (ctx, image, draw) {
    ctx.filter = 'grayscale(1)';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);
    ctx.filter = 'none'; // сбрасываем, чтобы не влиять на дальнейшую отрисовку
};