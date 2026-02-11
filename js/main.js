// Главный файл приложения
import { ui } from './modules/ui.js';
import { storage } from './modules/storage.js';
import { taskManager } from './modules/tasks.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await ui.init();
        console.log('Приложение успешно запущено');
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        alert('Не удалось загрузить приложение. Пожалуйста, обновите страницу.');
    }
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Глобальная ошибка:', event.error);
});

// Сохранение состояния перед закрытием
window.addEventListener('beforeunload', () => {
    // Можно сохранять текущее состояние марафона
});
