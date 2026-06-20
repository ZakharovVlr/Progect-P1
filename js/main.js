'use strict'

// Для Fabric.js v5
import { fabric } from 'fabric'; 

// 1. Инициализируем холст Fabric.js
const canvas = new fabric.Canvas('canvas');

// 2. Находим элемент инпута
const imageLoader = document.getElementById('imageLoader');

// 3. Вешаем событие на изменение инпута (выбор файла)
imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    const reader = new FileReader();

    // Читаем первый выбранный файл
    const file = e.target.files[0];

    if (!file) return;

    // Когда файл успешно прочитан...
    reader.onload = function (event) {
        const imgObj = new Image();
        imgObj.src = event.target.result;

        // Когда изображение загрузилось в память...
        imgObj.onload = function () {
            // Создаем объект изображения Fabric.js
            const fabricImg = new fabric.Image(imgObj);

            // Опционально: масштабируем, если фото больше холста
            fabricImg.scaleToWidth(300);

            // Добавляем изображение на холст и обновляем его
            canvas.add(fabricImg);
            canvas.renderAll();
        };
    };

    // Запускаем чтение файла в формате DataURL
    reader.readAsDataURL(file);
}
