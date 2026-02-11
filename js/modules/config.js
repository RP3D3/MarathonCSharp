// Конфигурация приложения
export const CONFIG = {
    APP_NAME: 'C# Marathon',
    VERSION: '1.0.0',
    
    // Пути к данным
    DATA_PATHS: {
        INDEX: './js/data/index.json',
        MATERIALS: './js/data/materials.json',
        TOPICS: './js/data/topics/'
    },
    
    // Настройки по умолчанию
    DEFAULTS: {
        DIFFICULTY_FROM: 1,
        DIFFICULTY_TO: 3,
        TASK_COUNT: 5,
        MAX_TASK_COUNT: 30, // Увеличили с 20 до 30
        MIN_TASK_COUNT: 1
    },
    
    // Пресеты количества заданий (для быстрого выбора)
    TASK_COUNT_PRESETS: [1, 3, 5, 10, 15, 20, 30],
    
    // Ключи для localStorage
    STORAGE_KEYS: {
        HISTORY: 'csharp_marathon_history',
        LAST_SETTINGS: 'csharp_marathon_last_settings',
        TASKS_CACHE: 'csharp_marathon_tasks_cache'
    },
    
    // URL документации
    DOCS_BASE_URL: 'https://metanit.com/sharp/tutorial/',
    DOCS_SECTIONS: {
        'арифметика': '2.4.php',
        'условные операторы': '2.5.php',
        'циклы': '2.6.php',
        'массивы': '3.1.php',
        'строки': '3.2.php',
        'функции': '3.3.php',
        'классы': '4.1.php',
        'наследование': '4.2.php',
        'интерфейсы': '4.3.php'
    }
};