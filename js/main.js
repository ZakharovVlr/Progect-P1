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
    const filterButtons = document.querySelectorAll('.filter-btn');
    const historyControls = document.getElementById('historyControls');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (!canvas || !fileInput || !previewBlock || !editorBlock || !uploadZone
        || !toolbarsWrapper || !filtersBtn || !filtersMenu || !filtersMenuClose
        || !historyControls || !undoBtn || !redoBtn) {
        console.error('Не найдены все элементы. Проверьте id в HTML.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Контекст canvas не получен');
        return;
    }

    let hasPhoto = false;
    let currentImage = null;
    let currentDraw = { offsetX: 0, offsetY: 0, width: 0, height: 0 };

    // История для undo/redo: массив снимков canvas + указатель на текущий снимок
    let historyStack = [];
    let historyIndex = -1;

    function setActiveFilterButton(filterName) {
        filterButtons.forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filter === filterName);
        });
    }

    // Обновляет доступность кнопок Undo/Redo в зависимости от положения указателя
    function updateHistoryButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= historyStack.length - 1;
    }

    // Сохраняет текущее состояние canvas в историю.
    // Если до этого был откат назад (undo), все "будущие" состояния обрезаются —
    // так работает undo/redo в любом редакторе: новое действие стирает старый redo-путь.
    function pushHistory(filterName) {
        historyStack = historyStack.slice(0, historyIndex + 1);

        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyStack.push({ imageData: snapshot, filterName });
        historyIndex = historyStack.length - 1;

        updateHistoryButtons();
    }

    // Восстанавливает canvas и состояние активной кнопки фильтра из снимка по индексу
    function restoreHistory(index) {
        const entry = historyStack[index];
        if (!entry) return;

        ctx.putImageData(entry.imageData, 0, 0);
        setActiveFilterButton(entry.filterName);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onerror = () => alert('Ошибка чтения файла');
        reader.onload = function (e) {
            const img = new Image();
            img.onerror = () => alert('Файл не является изображением');
            img.onload = function () {
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const offsetX = (canvas.width - newWidth) / 2;
                const offsetY = (canvas.height - newHeight) / 2;

                currentImage = img;
                currentDraw = { offsetX, offsetY, width: newWidth, height: newHeight };

                FilterEngine.render(ctx, canvas, currentImage, currentDraw, 'none');
                setActiveFilterButton('none');

                // Начинаем историю заново для нового изображения
                historyStack = [];
                historyIndex = -1;
                pushHistory('none');

                previewBlock.style.display = 'none';
                editorBlock.style.display = 'grid';
                toolbarsWrapper.classList.remove('is-hidden');
                historyControls.classList.remove('is-hidden');

                hasPhoto = true;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', handleFileSelect);

    filtersBtn.addEventListener('click', () => {
        if (!hasPhoto) return;
        toolbarsWrapper.classList.add('is-hidden');
        filtersMenu.classList.remove('is-hidden');
        filtersBtn.setAttribute('aria-expanded', 'true');
    });

    filtersMenuClose.addEventListener('click', () => {
        filtersMenu.classList.add('is-hidden');
        toolbarsWrapper.classList.remove('is-hidden');
        filtersBtn.setAttribute('aria-expanded', 'false');
    });

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filterName = btn.dataset.filter;
            FilterEngine.render(ctx, canvas, currentImage, currentDraw, filterName);
            setActiveFilterButton(filterName);
            pushHistory(filterName);
        });
    });

    undoBtn.addEventListener('click', () => {
        if (historyIndex <= 0) return;
        historyIndex -= 1;
        restoreHistory(historyIndex);
        updateHistoryButtons();
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex >= historyStack.length - 1) return;
        historyIndex += 1;
        restoreHistory(historyIndex);
        updateHistoryButtons();
    });
});