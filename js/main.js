
const fileInput = document.querySelector('#file-input');

fileInput.addEventListener('change', (event) => {
    // 1. Достаем файл из инпута (пользователь может выбрать несколько, берем первый)
    const file = event.target.files[0];

    // Если пользователь открыл окно, но ничего не выбрал и закрыл — выходим
    if (!file) return;

    // 2. БЕЗОПАСНОСТЬ: Проверяем тип файла. 
    // Даже если в HTML стоит accept="image/*", хакер может подсунуть другой файл.
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения (JPEG, PNG и др.)');
        return;
    }

    // 3. Создаем инструмент для чтения файлов
    const reader = new FileReader();

    // 4. Говорим браузеру, что делать, когда файл успешно прочитан
    reader.onload = (e) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Помним про CORS-защиту!

        img.onload = () => {
            // Здесь мы вызываем метод нашего движка CanvasEngine, 
            // который мы проектировали в прошлых шагах
            engine.initNewImage(img);
        };

        // e.target.result — это строка в формате Data URL (база данных картинки в виде текста)
        img.src = e.target.result;
    };

    // 5. Запускаем чтение файла как текстовой ссылки Data URL
    reader.readAsDataURL(file);
});