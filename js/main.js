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
    const buttonMenuClose = document.getElementById('buttonMenuClose');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const historyControls = document.getElementById('historyControls');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');


    // Находим новые элементы текстового меню
    const textMenu = document.getElementById('textMenu');
    const textMenuClose = document.getElementById('textMenuClose');
    const textInput = document.getElementById('textInput');
    const fontSelect = document.getElementById('fontSelect');
    const sizeInput = document.getElementById('sizeInput');
    const colorInput = document.getElementById('colorInput');


    // Допишите новые переменные в ваше существующее условие if, чтобы JS не падал, если их нет в HTML
    if (!canvas || !fileInput || !previewBlock || !editorBlock || !uploadZone
        || !toolbarsWrapper || !filtersBtn || !filtersMenu || !buttonMenuClose
        || !historyControls || !undoBtn || !redoBtn
        || !textMenu || !textMenuClose || !textInput || !fontSelect || !sizeInput || !colorInput) {
        console.error('Не найдены все элементы. Проверьте id в HTML.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Контекст canvas не получен');
        return;
    }

    // 1
    // 1
    // 1
    // 1
    // 1

    // 1. Находим кнопку в HTML по её уникальному ID
    // Где-то в начале main.js инициализируем как обычно:
    window.TextTool.init(canvas, ctx, () => {
        pushHistory(historyStack[historyIndex]?.filterName || 'none');
    });

    // Поиск кнопки "Текст" на главной панели
    const textButton = document.querySelector('#btn-add-text');

    // Клик по кнопке "Текст" — всего ОДНА строчка вызова!
    if (textButton) {
        textButton.addEventListener('click', () => {
            window.TextTool.openMenu(toolbarsWrapper, textButton, hasPhoto);
        });
    }
    // 2. 
    // 2.
    // 2.
    // 2. 

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

                // Генерируем превью для кнопок фильтров — логика вынесена в filter-previews.js
                FilterPreviews.generate(currentImage, filterButtons);

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

    document.querySelectorAll('.menu__close_button').forEach((closeBtn) => {
        closeBtn.addEventListener('click', () => {
            const menu = closeBtn.closest('[role="region"]'); // или другой общий признак меню
            if (menu) {
                menu.classList.add('is-hidden');
            }
            toolbarsWrapper.classList.remove('is-hidden');
            const triggerBtn = document.querySelector(`[aria-controls="${menu.id}"]`);
            triggerBtn.setAttribute('aria-expanded', 'false');
        });
    });

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const filterName = btn.dataset.filter;

            // Лоадер показывается на всё время обработки, но не менее
            // Loader.MIN_DISPLAY_MS, даже если конкретный фильтр отрабатывает быстрее.
            // Передаём именно canvas — так затемнение ляжет строго на область фото.
            await window.Loader.wrap(canvas, () => {
                FilterEngine.render(ctx, canvas, currentImage, currentDraw, filterName);
            });

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

    textButton.addEventListener('click', () => {
        // Получаем текущий снимок canvas БЕЗ текста (чистый фон)
        // В реальном приложении это делает основной скрипт, хранящий картинку
        const currentBaseSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Вызываем метод из нашего модуля
        window.TextTool.addDefaultText(currentBaseSnapshot);
    });

    const sizeSlider = document.getElementById('brushSizeSlider');
    let isDrawing = false;
    let strokePoints = [];

    // Флаг: был ли реально нарисован штрих в текущем "нажатии".
    // Просто клик без движения не должен создавать пустую запись в истории.
    let strokeHasChanges = false;

    // Переводит координаты события (мышь/тач/перо — Pointer Events единые
    // для всех устройств) в координаты внутренней системы canvas.
    //
    // Без этого пересчёта, если CSS-размер canvas (getBoundingClientRect())
    // отличается от его реального width/height — а это обычная ситуация,
    // когда canvas растянут/сжат стилями под макет — рисование "уезжает"
    // от курсора, и чем дальше от левого верхнего угла, тем сильнее
    // расхождение. Именно это давало эффект "начинается выше и левее".
    function getCanvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('pointerdown', (event) => {
        if (!hasPhoto) return;

        event.preventDefault();
        // Pointer Capture: canvas продолжит получать pointermove/pointerup
        // даже если палец/курсор уйдёт за его границы посреди штриха —
        // штрих не обрывается на полпути, а корректно завершается там,
        // где реально отпустили кнопку/палец.
        canvas.setPointerCapture(event.pointerId);

        isDrawing = true;
        strokeHasChanges = false;
        strokePoints = [getCanvasPoint(event)];
    }); // нажали кнопку мыши / коснулись пальцем / пером

    canvas.addEventListener('pointermove', (event) => {
        if (!isDrawing) return; // если не рисуем — вообще ничего не делаем, выходим сразу

        event.preventDefault();
        strokePoints.push(getCanvasPoint(event));

        // Более продвинутый метод рисования: вместо прямых отрезков между
        // редкими точками pointermove проводим квадратичную кривую Безье
        // через середины соседних точек. Это сглаживает "угловатость"
        // линии, особенно заметную при быстром движении, когда браузер
        // успевает прислать мало промежуточных точек.
        if (strokePoints.length > 2) {
            const [p0, p1, p2] = strokePoints.slice(-3);

            const midPoint1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
            const midPoint2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

            ctx.beginPath();
            ctx.moveTo(midPoint1.x, midPoint1.y);
            ctx.quadraticCurveTo(p1.x, p1.y, midPoint2.x, midPoint2.y); // p1 — контрольная точка кривой
            // Цвет читаем из общих настроек кисти (задаются в меню кисти,
            // brush-menu.js) — если по какой-то причине меню ещё не
            // инициализировалось, используем тот же цвет, что был по умолчанию.
            ctx.strokeStyle = window.BrushSettings ? window.BrushSettings.color : '#2600FF';
            ctx.lineWidth = sizeSlider.value;
            ctx.lineJoin = 'round'; // скругляет углы между соединёнными сегментами линии
            ctx.lineCap = 'round';  // скругляет концы каждого отдельного штриха
            ctx.stroke();
        }

        strokeHasChanges = true;
    }); // двигаем указатель (срабатывает постоянно, даже без рисования!)

    function finishStroke() {
        if (!isDrawing) return;
        isDrawing = false;
        strokePoints = [];

        if (!strokeHasChanges) return;

        // Записываем штрих в историю с тем же именем фильтра, что было
        // у предыдущего состояния — рисование кистью не меняет выбранный
        // фильтр, поэтому подсветка кнопки фильтра должна остаться прежней.
        pushHistory(historyStack[historyIndex]?.filterName || 'none');
        strokeHasChanges = false;
    }

    canvas.addEventListener('pointerup', finishStroke);   // отпустили кнопку/палец
    canvas.addEventListener('pointercancel', finishStroke); // системный жест прервал ввод (например, свайп смены приложений на телефоне)
});
