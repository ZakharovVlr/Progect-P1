document.addEventListener('DOMContentLoaded', function () {
    const toolbarsWrapper = document.getElementById('toolbarsWrapper');
    const brush = document.getElementById('btn-brush');
    const brushMenu = document.getElementById('brushMenu'); 
    // и логику открытия/закрытия меню
    brush.addEventListener('click', () => {
        toolbarsWrapper.classList.add('is-hidden');
        brushMenu.classList.toggle('is-hidden');
        brush.setAttribute('aria-expanded', 'true');
});
    
});