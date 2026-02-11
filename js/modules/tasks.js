import { CONFIG } from "./config.js";
import { storage } from "./storage.js";

// Управление заданиями
class TaskManager {
  constructor() {
    this.topicsIndex = null;
  }

  // Загрузка индекса тем
  async loadTopicsIndex() {
    if (this.topicsIndex) return this.topicsIndex;

    try {
      const response = await fetch(CONFIG.DATA_PATHS.INDEX);
      this.topicsIndex = await response.json();
      return this.topicsIndex;
    } catch (error) {
      console.error("Ошибка загрузки индекса тем:", error);
      throw error;
    }
  }

  // Загрузка заданий по тегам и сложности
  async loadTasks(
    tags,
    difficultyFrom,
    difficultyTo,
    count,
    specificTaskIds = null,
  ) {
    try {
      await this.loadTopicsIndex();

      // Собираем задания из всех выбранных тегов
      let allAvailableTasks = [];

      for (const tagInfo of tags) {
        const tagTasks = await this.loadTasksForTag(tagInfo);
        const filteredTasks = tagTasks.filter(
          (task) =>
            task.difficulty >= difficultyFrom &&
            task.difficulty <= difficultyTo,
        );

        allAvailableTasks = [...allAvailableTasks, ...filteredTasks];
      }

      if (allAvailableTasks.length === 0) {
        console.error("Нет заданий для выбранных параметров");
        return [];
      }

      // Если указаны конкретные ID заданий
      if (specificTaskIds && specificTaskIds.length > 0) {
        return this.selectSpecificTasks(allAvailableTasks, specificTaskIds);
      }

      // Иначе выбираем случайные задания
      return this.selectRandomTasks(allAvailableTasks, count);
    } catch (error) {
      console.error("Ошибка загрузки заданий:", error);
      throw error;
    }
  }
async getTasksStats(tags, difficultyFrom, difficultyTo) {
    try {
        await this.loadTopicsIndex();
        
        let totalAvailable = 0;
        const statsByTag = [];
        
        for (const tagInfo of tags) {
            const tagTasks = await this.loadTasksForTag(tagInfo);
            const filteredTasks = tagTasks.filter(task => 
                task.difficulty >= difficultyFrom && 
                task.difficulty <= difficultyTo
            );
            
            statsByTag.push({
                tag: tagInfo.tag,
                available: filteredTasks.length,
                difficultyRange: `${difficultyFrom}-${difficultyTo}`
            });
            
            totalAvailable += filteredTasks.length;
        }
        
        return {
            total: totalAvailable,
            byTag: statsByTag
        };
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        return null;
    }
}
  // Загрузка заданий для конкретного тега
  async loadTasksForTag(tagInfo) {
    // Проверяем кэш
    const cached = storage.getCachedTasks(tagInfo.tag);
    if (cached) return cached;

    try {
      // Ищем файл с заданиями
      let filePath = tagInfo.file;
      if (!filePath) {
        const topic = this.topicsIndex.topics.find(
          (t) => t.tag === tagInfo.tag,
        );
        if (topic) {
          filePath = topic.file;
        }
      }

      if (!filePath) {
        throw new Error(`Не найден файл для тега ${tagInfo.tag}`);
      }

      const response = await fetch(
        CONFIG.DATA_PATHS.TOPICS + filePath.split("/").pop(),
      );
      const data = await response.json();

      // Преобразуем структуру данных
      const tasks = [];
      data.difficultyLevels.forEach((level) => {
        level.tasks.forEach((task) => {
          tasks.push({
            ...task,
            difficulty: level.level,
            tag: data.tag,
          });
        });
      });

      // Сохраняем в кэш
      storage.cacheTasks(tagInfo.tag, tasks);

      return tasks;
    } catch (error) {
      console.error(`Ошибка загрузки заданий для тега ${tagInfo.tag}:`, error);
      return [];
    }
  }

  // Выбор случайных заданий
  selectRandomTasks(tasks, count) {
    if (!tasks || tasks.length === 0) return [];

    // Если запрошенное количество больше доступных заданий
    if (count >= tasks.length) {
      console.log(
        `Запрошено ${count} заданий, доступно ${tasks.length}. Возвращаем все доступные задания в случайном порядке.`,
      );
      // Перемешиваем все доступные задания
      return [...tasks].sort(() => 0.5 - Math.random());
    }

    // Если запрошенное количество меньше доступных заданий
    console.log(`Выбираем ${count} случайных заданий из ${tasks.length}`);

    // Алгоритм Фишера-Йетса для случайной выборки без повторений
    const shuffled = [...tasks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  // Выбор конкретных заданий
  selectSpecificTasks(tasks, taskIds) {
    return taskIds
      .map((id) => tasks.find((task) => task.id === id))
      .filter((task) => task !== undefined);
  }

  // Получение материалов по тегам
  async loadMaterials() {
    try {
      const response = await fetch(CONFIG.DATA_PATHS.MATERIALS);
      return await response.json();
    } catch (error) {
      console.error("Ошибка загрузки материалов:", error);
      return { materialsByTag: [] };
    }
  }

  // Поиск материалов по тегам
  async findMaterialsByTags(tags) {
    const materialsData = await this.loadMaterials();
    const tagsList = tags.map((t) => (typeof t === "string" ? t : t.tag));

    return materialsData.materialsByTag.filter((m) => tagsList.includes(m.tag));
  }
}

export const taskManager = new TaskManager();
