// ===== Логика циклического переключения =====
// ===== Логика переключения между двумя темами =====
document.addEventListener('DOMContentLoaded', () => {
  const switchEl = document.querySelector('.theme-switch');
  const themes = ['light', 'dark'];

  // Определяем текущую тему
  function getCurrentTheme() {
    // 1. Проверяем localStorage
    const stored = localStorage.getItem('theme');
    if (stored && themes.includes(stored)) return stored;

    // 2. Проверяем классы на <html>
    const htmlClass = document.documentElement.className;
    const match = htmlClass.match(/theme-(\w+)/);
    if (match && themes.includes(match[1])) return match[1];

    // 3. По умолчанию — светлая
    return 'light';
  }

  function setTheme(theme) {
    // Обновляем классы на <html>
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${theme}`);

    // Сохраняем в localStorage
    localStorage.setItem('theme', theme);

    // Обновляем состояние переключателя
    switchEl.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  // Инициализация
  setTheme(getCurrentTheme());

  // Обработчик клика
  switchEl.addEventListener('click', toggleTheme);
});