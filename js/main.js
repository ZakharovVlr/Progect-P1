'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const fileInput = document.getElementById('image-loader');
    const previewBlock = document.getElementById('previewBlock');
    const editorBlock = document.getElementById('editorBlock');
    const uploadZone = document.getElementById('uploadZone');

    // Проверяем все элементы
    if (!canvas || !fileInput || !previewBlock || !editorBlock || !uploadZone) {
        console.error('Не найдены все элементы. Проверьте id в HTML.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Контекст canvas не получен');
        return;
    }

    // Если в HTML заданы width/height, используем их, но можно и синхронизировать с CSS при желании
    // В данном случае оставляем атрибуты как есть — они определяют рабочую область.
    // Если canvas-wrapper имеет резиновую ширину, раскомментируйте блок:
    // function syncCanvasSize() {
    //     canvas.width = canvas.clientWidth;
    //     canvas.height = canvas.clientHeight;
    // }
    // syncCanvasSize();
    // window.addEventListener('resize', syncCanvasSize);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onerror = () => alert('Ошибка чтения файла');
        reader.onload = function (e) {
            const img = new Image();
            img.onerror = () => alert('Файл не является изображением');
            img.onload = function () {
                // Если вы хотите, чтобы canvas подстраивался под размер контейнера,
                // раскомментируйте syncCanvasSize() здесь.
                // syncCanvasSize();

                // Масштабируем с сохранением пропорций
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const offsetX = (canvas.width - newWidth) / 2;
                const offsetY = (canvas.height - newHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                previewBlock.style.display = 'none';
                editorBlock.style.display = 'flex';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', handleFileSelect);

    uploadZone.addEventListener('click', (e) => {
        if (e.target.closest('#uploadZone')) {
            fileInput.click();
        }
    });
});