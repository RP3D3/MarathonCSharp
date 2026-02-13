import { CONFIG } from "./config.js";

// Управление localStorage
class StorageManager {
  // Сохранить историю
  saveHistory(history) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        JSON.stringify(history),
      );
      return true;
    } catch (e) {
      console.error("Ошибка сохранения истории:", e);
      return false;
    }
  }

  // Загрузить историю
  loadHistory() {
    try {
      const history = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error("Ошибка загрузки истории:", e);
      return [];
    }
  }

  // Очистить историю
  clearHistory() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
      return true;
    } catch (e) {
      console.error("Ошибка очистки истории:", e);
      return false;
    }
  }

  // Добавить запись в историю
  addHistoryEntry(entry) {
    const history = this.loadHistory();

    // Добавляем новую запись в начало
    history.unshift({
      id: Date.now(),
      date: new Date().toLocaleString(),
      ...entry,
    });

    // Ограничиваем историю до 50 записей
    if (history.length > 50) {
      history.pop();
    }

    this.saveHistory(history);
    return history;
  }

  // Сохранить последние настройки
  saveLastSettings(settings) {
    try {
      // Создаём копию настроек без фамилии
      const settingsWithoutName = {
        tags: settings.tags,
        difficulty: settings.difficulty,
        taskCount: settings.taskCount,
      };

      localStorage.setItem(
        CONFIG.STORAGE_KEYS.LAST_SETTINGS,
        JSON.stringify(settingsWithoutName),
      );
      return true;
    } catch (e) {
      console.error("Ошибка сохранения настроек:", e);
      return false;
    }
  }

  // Загрузить последние настройки
  loadLastSettings() {
    try {
      const settings = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (e) {
      console.error("Ошибка загрузки настроек:", e);
      return null;
    }
  }

  // Кэширование заданий
  cacheTasks(tag, tasks) {
    try {
      const cache = this.loadTasksCache();
      cache[tag] = {
        timestamp: Date.now(),
        tasks: tasks,
      };
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.TASKS_CACHE,
        JSON.stringify(cache),
      );
      return true;
    } catch (e) {
      console.error("Ошибка кэширования заданий:", e);
      return false;
    }
  }

  // Загрузить кэш заданий
  loadTasksCache() {
    try {
      const cache = localStorage.getItem(CONFIG.STORAGE_KEYS.TASKS_CACHE);
      return cache ? JSON.parse(cache) : {};
    } catch (e) {
      console.error("Ошибка загрузки кэша:", e);
      return {};
    }
  }

  // Получить задания из кэша
  getCachedTasks(tag) {
    const cache = this.loadTasksCache();
    const cached = cache[tag];

    if (!cached) return null;
    if (cached.version !== CONFIG.DATA_VERSION) {
      console.log(
        `Кэш устарел (версия ${cached.version}, текущая ${CONFIG.DATA_VERSION})`,
      );
      return null;
    }
    // Кэш действителен 24 часа
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - cached.timestamp > oneDay) {
      return null;
    }

    return cached.tasks;
  }

  // Очистить кэш
  clearCache() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.TASKS_CACHE);
      return true;
    } catch (e) {
      console.error("Ошибка очистки кэша:", e);
      return false;
    }
  }
}

export const storage = new StorageManager();
