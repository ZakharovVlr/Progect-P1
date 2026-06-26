'use strict'

document.addEventListener('DOMContentLoaded', function () {
    // здесь весь код

// 1. Инициализируем холст 
const canvas = document.getElementById('canvas');
// 2. Контекст для рисования
const ctx = canvas.getContext('2d');
// 3. Находим элемент инпута
const fileInput = document.getElementById('image-loader');

// 4. Вешаем событие на изменение инпута (выбор файла)
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    // Получаем файл:
    const file = event.target.files[0];
    //Проверяем, что файл - изображение
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // 1. Вычислить масштаб так, чтобы картинка вписалась и не увеличивалась
            const scale = Math.min(1, canvas.width / img.width, canvas.height / img.height);

            // 2. Вычислить новые размеры
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;

            // 3. Вычислить смещение для центрирования
            const offsetX = (canvas.width - newWidth) / 2;
            const offsetY = (canvas.height - newHeight) / 2;

            // 4. Очистить холст
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 5. Нарисовать изображение с учётом масштаба и центрирования
            ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

            // 6. Скрыть зону загрузки
            document.querySelector('.upload-zone').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);

}

});








///sidebar


const menuDialog = document.getElementById('menu-dialog');
menuDialog.addEventListener('click', (e) => {
    const rect = menuDialog.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
        menuDialog.close();
    }
});