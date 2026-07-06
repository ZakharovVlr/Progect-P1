'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const fileInput = document.getElementById('image-loader');
    const previewBlock = document.getElementById('previewBlock');
    const editorBlock = document.getElementById('editorBlock');
    const uploadZone = document.getElementById('uploadZone');
    const toolbarsWrapper = document.getElementById('toolbarsWrapper');
    const filtersBtn = document.getElementById('filtersBtn');
    const filtersMenu = document.getElementById('filtersMenu');
    const filtersMenuClose = document.getElementById('filtersMenuClose');

    if (!canvas || !fileInput || !previewBlock || !editorBlock || !uploadZone
        || !toolbarsWrapper || !filtersBtn || !filtersMenu || !filtersMenuClose) {
        console.error('Не найдены все элементы. Проверьте id в HTML.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Контекст canvas не получен');
        return;
    }

    // Флаг: было ли уже загружено фото
    let hasPhoto = false;

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onerror = () => alert('Ошибка чтения файла');
        reader.onload = function (e) {
            const img = new Image();
            img.onerror = () => alert('Файл не является изображением');
            img.onload = function () {
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const offsetX = (canvas.width - newWidth) / 2;
                const offsetY = (canvas.height - newHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                previewBlock.style.display = 'none';
                editorBlock.style.display = 'grid';
                toolbarsWrapper.classList.remove('is-hidden');

                hasPhoto = true; // теперь фильтрами можно пользоваться
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', handleFileSelect);

    // Открыть меню фильтров — только если фото уже загружено
    filtersBtn.addEventListener('click', () => {
        if (!hasPhoto) return; // защита: без фото меню не откроется

        toolbarsWrapper.classList.add('is-hidden');
        filtersMenu.classList.remove('is-hidden');
        filtersBtn.setAttribute('aria-expanded', 'true');
    });

    filtersMenuClose.addEventListener('click', () => {
        filtersMenu.classList.add('is-hidden');
        toolbarsWrapper.classList.remove('is-hidden');
        filtersBtn.setAttribute('aria-expanded', 'false');
    });
});