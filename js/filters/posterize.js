'use strict';

window.Filters = window.Filters || {};

// Фильтр "Постеризация" — сверхчеткий советский плакат.
// Сохраняет идеальную гладкость неба, но возвращает резкость
// мелким деталям архитектуры (часам, шпилям) и обводит их тонкими линиями.
Filters.posterize = function (ctx, image, draw) {
    ctx.filter = 'none';
    ctx.drawImage(image, draw.offsetX, draw.offsetY, draw.width, draw.height);

    const w = draw.width;
    const h = draw.height;

    const imageData = ctx.getImageData(draw.offsetX, draw.offsetY, w, h);
    const data = imageData.data;

    // Неизменяемая копия оригинальных пикселей для восстановления резкости
    const src = new Uint8ClampedArray(data);
    const getIndex = (x, y) => (y * w + x) * 4;

    const getPixel = (x, y) => {
        const idx = getIndex(x, y);
        return [src[idx], src[idx + 1], src[idx + 2]];
    };

    // Вспомогательные функции яркости вынесены за пределы циклов —
    // раньше пересоздавались на каждой итерации пикселя, что сильно
    // нагружало сборщик мусора и замедляло фильтр.
    const getGraySrc = (px, py) => {
        const i = getIndex(px, py);
        return 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    };

    // ШАГ 1: Алгоритм Кувахары (сглаживание плакатных плашек)
    // Радиус увеличен с 3 до 5 — крупнее и чище плашки цвета,
    // меньше "шумных" мелких деталей на волосах и фоне.
    const radius = 5;

    for (let y = radius; y < h - radius; y++) {
        for (let x = radius; x < w - radius; x++) {
            const idx = getIndex(x, y);

            const regions = [
                { x1: x - radius, x2: x, y1: y - radius, y2: y },
                { x1: x, x2: x + radius, y1: y - radius, y2: y },
                { x1: x - radius, x2: x, y1: y, y2: y + radius },
                { x1: x, x2: x + radius, y1: y, y2: y + radius }
            ];

            let minVariance = Infinity;
            let bestR = 0, bestG = 0, bestB = 0;

            for (let r = 0; r < 4; r++) {
                const reg = regions[r];
                let sumR = 0, sumG = 0, sumB = 0;
                let sumR2 = 0, sumG2 = 0, sumB2 = 0;
                let count = 0;

                for (let py = reg.y1; py <= reg.y2; py++) {
                    for (let px = reg.x1; px <= reg.x2; px++) {
                        const [pr, pg, pb] = getPixel(px, py);
                        sumR += pr; sumG += pg; sumB += pb;
                        sumR2 += pr * pr; sumG2 += pg * pg; sumB2 += pb * pb;
                        count++;
                    }
                }

                const meanR = sumR / count; const meanG = sumG / count; const meanB = sumB / count;
                const varR = (sumR2 / count) - (meanR * meanR);
                const varG = (sumG2 / count) - (meanG * meanG);
                const varB = (sumB2 / count) - (meanB * meanB);
                const totalVariance = varR + varG + varB;

                if (totalVariance < minVariance) {
                    minVariance = totalVariance;
                    bestR = meanR; bestG = meanG; bestB = meanB;
                }
            }

            data[idx] = bestR;
            data[idx + 1] = bestG;
            data[idx + 2] = bestB;
        }
    }

    // Необработанная рамка (шириной radius) — заполняем исходными пикселями,
    // чтобы туда не "протекали" случайные нулевые/сырые значения при копировании.
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (x < radius || x >= w - radius || y < radius || y >= h - radius) {
                const idx = getIndex(x, y);
                data[idx] = src[idx];
                data[idx + 1] = src[idx + 1];
                data[idx + 2] = src[idx + 2];
            }
        }
    }

    // Сохраняем сглаженные данные
    const smoothedData = new Uint8ClampedArray(data);

    const getGraySmoothed = (px, py) => {
        const i = getIndex(px, py);
        return 0.299 * smoothedData[i] + 0.587 * smoothedData[i + 1] + 0.114 * smoothedData[i + 2];
    };

    // ШАГ 2а: считаем карту границ (Sobel) по сглаженным данным заранее,
    // чтобы потом можно было "расширить" границы и убрать разрывы линии.
    const edgeMap = new Float32Array(w * h);

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const gx = (getGraySmoothed(x + 1, y - 1) + 2 * getGraySmoothed(x + 1, y) + getGraySmoothed(x + 1, y + 1)) -
                (getGraySmoothed(x - 1, y - 1) + 2 * getGraySmoothed(x - 1, y) + getGraySmoothed(x - 1, y + 1));
            const gy = (getGraySmoothed(x - 1, y + 1) + 2 * getGraySmoothed(x, y + 1) + getGraySmoothed(x + 1, y + 1)) -
                (getGraySmoothed(x - 1, y - 1) + 2 * getGraySmoothed(x, y - 1) + getGraySmoothed(x + 1, y - 1));

            edgeMap[y * w + x] = Math.sqrt(gx * gx + gy * gy);
        }
    }

    // Порог оставлен строгим (65), потому что карта границ считается по
    // уже сглаженным (Кувахара) данным — случайного шума там мало,
    // и заниженный порог не нужен. Дилатация расширена до 2px радиуса,
    // чтобы линия не рвалась даже на резких изгибах контура (подбородок,
    // граница волос и лба).
    const EDGE_THRESHOLD = 65;
    const isEdge = new Uint8Array(w * h);

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            if (edgeMap[i] > EDGE_THRESHOLD) {
                isEdge[i] = 1;
            }
        }
    }

    const DILATE_RADIUS = 2;
    const isEdgeDilated = new Uint8Array(w * h);
    for (let y = DILATE_RADIUS; y < h - DILATE_RADIUS; y++) {
        for (let x = DILATE_RADIUS; x < w - DILATE_RADIUS; x++) {
            const i = y * w + x;
            let found = false;
            for (let dy = -DILATE_RADIUS; dy <= DILATE_RADIUS && !found; dy++) {
                for (let dx = -DILATE_RADIUS; dx <= DILATE_RADIUS && !found; dx++) {
                    if (isEdge[(y + dy) * w + (x + dx)]) {
                        found = true;
                    }
                }
            }
            isEdgeDilated[i] = found ? 1 : 0;
        }
    }

    // ШАГ 2а-доп: карта детализации по ИСХОДНОМУ изображению, но УСРЕДНЁННАЯ
    // по окрестности 3x3. Одна волосинка или блик дают всплеск на 1 пикселе —
    // после усреднения такой всплеск гасится и не считается "деталью".
    // Настоящая протяжённая граница (контур часов, шпиля и т.п.) остаётся
    // высокой даже после усреднения, потому что высока у всех соседей разом.
    const rawDetail = new Float32Array(w * h);

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const sx = (getGraySrc(x + 1, y - 1) + 2 * getGraySrc(x + 1, y) + getGraySrc(x + 1, y + 1)) -
                (getGraySrc(x - 1, y - 1) + 2 * getGraySrc(x - 1, y) + getGraySrc(x - 1, y + 1));
            const sy = (getGraySrc(x - 1, y + 1) + 2 * getGraySrc(x, y + 1) + getGraySrc(x + 1, y + 1)) -
                (getGraySrc(x - 1, y - 1) + 2 * getGraySrc(x, y - 1) + getGraySrc(x + 1, y - 1));
            rawDetail[y * w + x] = Math.sqrt(sx * sx + sy * sy);
        }
    }

    const localDetail = new Float32Array(w * h);
    for (let y = 2; y < h - 2; y++) {
        for (let x = 2; x < w - 2; x++) {
            let sum = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    sum += rawDetail[(y + dy) * w + (x + dx)];
                }
            }
            localDetail[y * w + x] = sum / 9;
        }
    }

    // ШАГ 2б: постеризация + выборочное восстановление резкости + контуры
    const LEVELS = 4;
    const step = 255 / (LEVELS - 1);

    // Бинарный (не непрерывный!) порог: либо пиксель — часть настоящей
    // резкой границы, либо нет. Небольшая фиксированная примесь (0.3),
    // а не плавающая доля — иначе соседние пиксели после округления
    // расходятся по разным уровням постеризации и получается "рябь".
    const DETAIL_THRESHOLD = 160;
    const SHARPNESS_MIX = 0.3;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = getIndex(x, y);

            const sharpnessRatio = localDetail[y * w + x] > DETAIL_THRESHOLD ? SHARPNESS_MIX : 0;

            let r = smoothedData[idx] * (1 - sharpnessRatio) + src[idx] * sharpnessRatio;
            let g = smoothedData[idx + 1] * (1 - sharpnessRatio) + src[idx + 1] * sharpnessRatio;
            let b = smoothedData[idx + 2] * (1 - sharpnessRatio) + src[idx + 2] * sharpnessRatio;

            // Постеризация
            r = Math.round(r / step) * step;
            g = Math.round(g / step) * step;
            b = Math.round(b / step) * step;

            // Ретро-тонирование (под старую журнальную бумагу)
            data[idx] = r * 1.06 + 5;
            data[idx + 1] = g * 1.02 + 5;
            data[idx + 2] = b * 0.88 + 2;

            // Наложение обводки по расширенной (dilated) карте границ —
            // сплошная линия вместо пунктира
            if (isEdgeDilated[y * w + x]) {
                data[idx] *= 0.45;
                data[idx + 1] *= 0.45;
                data[idx + 2] *= 0.45;
            }
        }
    }

    ctx.putImageData(imageData, draw.offsetX, draw.offsetY);
};