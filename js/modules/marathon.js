import { taskManager } from './tasks.js';
import { ui } from './ui.js';

// Управление марафоном
class Marathon {
    constructor() {
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.settings = null;
    }
    
    // Загрузка заданий для марафона
    async loadTasks(tags, difficultyFrom, difficultyTo, count, specificTaskIds = null) {
        this.tasks = await taskManager.loadTasks(
            tags, 
            difficultyFrom, 
            difficultyTo, 
            count, 
            specificTaskIds
        );
        return this.tasks;
    }
    
    // Установка заданий
    setTasks(tasks) {
        this.tasks = tasks;
    }
    
    // Установка текущего задания
    setCurrentTask(index) {
        if (index >= 0 && index < this.tasks.length) {
            this.currentTaskIndex = index;
        }
    }
    
    // Получить текущее задание
    getCurrentTask() {
        return this.tasks[this.currentTaskIndex] || null;
    }
    
    // Получить текущий индекс
    getCurrentIndex() {
        return this.currentTaskIndex;
    }
    
    // Получить количество заданий
    getTotalTasks() {
        return this.tasks.length;
    }
    
    // Следующее задание
    nextTask() {
        if (this.currentTaskIndex < this.tasks.length - 1) {
            this.currentTaskIndex++;
            ui.updateMarathonUI();
        }
    }
    
    // Предыдущее задание
    prevTask() {
        if (this.currentTaskIndex > 0) {
            this.currentTaskIndex--;
            ui.updateMarathonUI();
        } else {
            // На первом задании - возвращаемся в меню настроек
            ui.switchScreen('setup');
        }
    }
    
    // Сохранить настройки марафона
    setSettings(settings) {
        this.settings = settings;
    }
    
    // Получить выбранные теги
    getSelectedTags() {
        return this.settings?.tags || [];
    }
}

export const marathon = new Marathon();