'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('image-loader');
    const previewBlock = document.getElementById('previewBlock');
    const editorBlock = document.getElementById('editorBlock');
    const uploadZone = document.getElementById('uploadZone');

    // === Обработка выбора файла ===
    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Масштабируем и центрируем
                const scale = Math.min(1, canvas.width / img.width, canvas.height / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const offsetX = (canvas.width - newWidth) / 2;
                const offsetY = (canvas.height - newHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                // Переключаем видимость: показываем редактор, скрываем превью
                previewBlock.style.display = 'none';
                editorBlock.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }


    // Дополнительно: клик по зоне (кроме label) тоже открывает выбор
    uploadZone.addEventListener('click', (e) => {
        if (e.target === uploadZone || e.target.closest('.upload-zone')) {
            fileInput.click();
        }
    });
});