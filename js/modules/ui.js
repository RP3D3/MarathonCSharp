import { CONFIG } from "./config.js";
import { storage } from "./storage.js";
import { marathon } from "./marathon.js";
import { docManager } from "./documentation.js";
import { taskManager } from './tasks.js';

// Управление интерфейсом
class UIManager {
  constructor() {
    this.elements = {};
    this.currentScreen = "setup";
    this.isLoading = false;
    this.topics = [];
    this.copiedTasks = new Set(); // Множество для хранения ID скопированных заданий
  }

  // Инициализация UI
  async init() {
    this.cacheElements();
    this.attachEvents();
    await this.loadTopics();

    // Сбрасываем все теги после загрузки
    setTimeout(() => {
      this.deselectAllTags();
    }, 50);

    this.loadHistory();
    this.loadLastSettings();
    this.initMobileHeader();

    // Инициализируем слайдер
    if (this.elements.setup.taskCountSlider) {
      this.elements.setup.taskCountSlider.max = CONFIG.DEFAULTS.MAX_TASK_COUNT;
    }

    // Обновляем отображение максимального количества
    if (this.elements.setup.taskCountMax) {
      this.elements.setup.taskCountMax.textContent = `/ ${CONFIG.DEFAULTS.MAX_TASK_COUNT}`;
    }
  }

  // Кэширование DOM элементов
  cacheElements() {
    this.elements = {
      screens: {
        setup: document.getElementById("setup-screen"),
        marathon: document.getElementById("marathon-screen"),
      },
      setup: {
        lastname: document.getElementById("lastname"),
        taskCountValue: document.getElementById("task-count-value"),
        taskCountMinus: document.getElementById("task-count-minus"),
        taskCountPlus: document.getElementById("task-count-plus"),
        taskCountSlider: document.getElementById("task-count-slider"),
        difficultyBtns: document.querySelectorAll(".difficulty-btn"),
        selectedDifficulty: document.getElementById("selected-difficulty"),
        presetBtns: document.querySelectorAll(".preset-btn"),
        taskCountMax: document.querySelector(".task-count-max"),
        tagsContainer: document.getElementById("tags-container"),
        selectAllTagsBtn: document.getElementById("select-all-tags"),
        deselectAllTagsBtn: document.getElementById("deselect-all-tags"),
        randomTagBtn: document.getElementById("random-tag"),
        difficultyFrom: document.getElementById("difficulty-from"),
        difficultyTo: document.getElementById("difficulty-to"),
        taskCountValue: document.getElementById("task-count-value"),
        taskCountMinus: document.getElementById("task-count-minus"),
        taskCountPlus: document.getElementById("task-count-plus"),
        startBtn: document.getElementById("start-marathon"),
        clearHistoryBtn: document.getElementById("clear-history-btn"),
        historyList: document.getElementById("history-list"),
      },
      marathon: {
        settingsBtn: document.getElementById("settings-btn"),
        currentTaskIndicator: document.getElementById("current-task-indicator"),
        taskTitle: document.getElementById("task-title"),
        taskDescription: document.getElementById("task-description"),
        requirementsList: document.getElementById("requirements-list"),
        hintText: document.getElementById("hint-text"),
        consoleOutput: document.getElementById("console-output"),
        prevBtn: document.getElementById("prev-btn"),
        nextBtn: document.getElementById("next-btn"),
        docBtn: document.getElementById("doc-btn"),
        copyBtn: document.getElementById("copy-task-btn"),
      },
      modal: {
        modal: document.getElementById("doc-modal"),
        content: document.getElementById("doc-content"),
        closeBtn: document.querySelector("#doc-modal .close"),
      },
      instruction: {
        modal: document.getElementById("instruction-modal"),
        codeExample: document.getElementById("instruction-code-example"),
        copyBtn: document.getElementById("instruction-copy-btn"),
        copyAndContinueBtn: document.getElementById("copy-and-continue-btn"),
        skipBtn: document.getElementById("skip-instruction-btn"),
        closeBtn: document.querySelector(".instruction-close"),
        alreadyCopiedMessage: document.getElementById("already-copied-message"),
      },
    };
  }

  // Привязка событий - ИСПРАВЛЕНО, добавлены проверки
  attachEvents() {
    // Настройки - проверяем существование элементов
    if (this.elements.setup.startBtn) {
      this.elements.setup.startBtn.addEventListener("click", () =>
        this.startMarathon(),
      );
    }

    // Кнопки управления тегами (РАЗДЕЛЬНЫЕ)
    if (this.elements.setup.selectAllTagsBtn) {
      this.elements.setup.selectAllTagsBtn.addEventListener("click", () =>
        this.selectAllTags(),
      );
    }
    // Кнопки сложности
    if (this.elements.setup.difficultyBtns) {
      this.elements.setup.difficultyBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const level = parseInt(btn.dataset.level);
          this.setDifficulty(level);
        });
      });
    }
    if (this.elements.setup.deselectAllTagsBtn) {
      this.elements.setup.deselectAllTagsBtn.addEventListener("click", () =>
        this.deselectAllTags(),
      );
    }

    if (this.elements.setup.randomTagBtn) {
      this.elements.setup.randomTagBtn.addEventListener("click", () =>
        this.addRandomTag(),
      );
    }

    // Валидация диапазона сложности
    if (this.elements.setup.difficultyFrom) {
      this.elements.setup.difficultyFrom.addEventListener("change", () =>
        this.validateDifficultyRange(),
      );
    }

    if (this.elements.setup.difficultyTo) {
      this.elements.setup.difficultyTo.addEventListener("change", () =>
        this.validateDifficultyRange(),
      );
    }

    if (this.elements.setup.taskCountMinus) {
      this.elements.setup.taskCountMinus.addEventListener("click", () => {
        const current = parseInt(
          this.elements.setup.taskCountValue.textContent,
        );
        if (current > CONFIG.DEFAULTS.MIN_TASK_COUNT) {
          this.updateTaskCount(current - 1);
        }
      });
    }

    if (this.elements.setup.taskCountPlus) {
      this.elements.setup.taskCountPlus.addEventListener("click", () => {
        const current = parseInt(
          this.elements.setup.taskCountValue.textContent,
        );
        if (current < CONFIG.DEFAULTS.MAX_TASK_COUNT) {
          this.updateTaskCount(current + 1);
        }
      });
    }

    // Слайдер количества заданий
    if (this.elements.setup.taskCountSlider) {
      this.elements.setup.taskCountSlider.addEventListener("input", (e) => {
        this.updateTaskCount(parseInt(e.target.value));
      });
    }

    // Пресеты количества заданий
    if (this.elements.setup.presetBtns) {
      this.elements.setup.presetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const count = parseInt(btn.dataset.count);
          this.updateTaskCount(count);
        });
      });
    }

    // Кнопка очистки истории
    if (this.elements.setup.clearHistoryBtn) {
      this.elements.setup.clearHistoryBtn.addEventListener("click", () =>
        this.clearHistory(),
      );
    }

    // Марафон - кнопка настроек (шестеренка)
    if (this.elements.marathon.settingsBtn) {
      this.elements.marathon.settingsBtn.addEventListener("click", () =>
        this.switchScreen("setup"),
      );
    }

    // Кнопка копирования задания в хедере
    if (this.elements.marathon.copyBtn) {
      this.elements.marathon.copyBtn.addEventListener("click", () =>
        this.copyCurrentTask(),
      );
    }

    // Навигация по заданиям
    if (this.elements.marathon.prevBtn) {
      this.elements.marathon.prevBtn.addEventListener("click", () => {
        marathon.prevTask();
        this.closeInstruction();
      });
    }

    if (this.elements.marathon.nextBtn) {
      this.elements.marathon.nextBtn.addEventListener("click", () =>
        this.handleNextTask(),
      );
    }

    // Документация
    if (this.elements.marathon.docBtn) {
      this.elements.marathon.docBtn.addEventListener("click", () =>
        docManager.openModal(),
      );
    }

    // Кнопка копирования в инструкции
    if (this.elements.instruction.copyBtn) {
      this.elements.instruction.copyBtn.addEventListener("click", () => {
        this.copyCurrentTask();
        // Отмечаем задание как скопированное
        const task = marathon.getCurrentTask();
        if (task) {
          this.copiedTasks.add(task.id);
          this.updateInstructionUI(true);
        }
      });
    }

    // Кнопка "Скопировано, продолжаем!"
    if (this.elements.instruction.copyAndContinueBtn) {
      this.elements.instruction.copyAndContinueBtn.addEventListener(
        "click",
        () => {
          this.closeInstruction();
          marathon.nextTask();
        },
      );
    }

    // Кнопка "Пропустить"
    if (this.elements.instruction.skipBtn) {
      this.elements.instruction.skipBtn.addEventListener("click", () => {
        this.closeInstruction();
        marathon.nextTask();
      });
    }

    // Крестик закрытия инструкции
    if (this.elements.instruction.closeBtn) {
      this.elements.instruction.closeBtn.addEventListener("click", () => {
        this.closeInstruction();
      });
    }

    // Модальное окно документации
    if (this.elements.modal.closeBtn) {
      this.elements.modal.closeBtn.addEventListener("click", () =>
        docManager.closeModal(),
      );
    }

    // Закрытие по клику вне модалок
    window.addEventListener("click", (e) => {
      if (e.target === this.elements.modal.modal) {
        docManager.closeModal();
      }
      if (e.target === this.elements.instruction.modal) {
        this.closeInstruction();
      }
    });
  }
  setDifficulty(level) {
    // Обновляем скрытое поле
    if (this.elements.setup.selectedDifficulty) {
      this.elements.setup.selectedDifficulty.value = level;
    }

    // Обновляем активный класс у кнопок
    if (this.elements.setup.difficultyBtns) {
      this.elements.setup.difficultyBtns.forEach((btn) => {
        const btnLevel = parseInt(btn.dataset.level);
        if (btnLevel === level) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  }
  // Новый метод для обновления количества заданий
  updateTaskCount(count) {
    // Проверяем границы
    count = Math.max(
      CONFIG.DEFAULTS.MIN_TASK_COUNT,
      Math.min(CONFIG.DEFAULTS.MAX_TASK_COUNT, count),
    );

    // Обновляем отображение
    if (this.elements.setup.taskCountValue) {
      this.elements.setup.taskCountValue.textContent = count;
    }

    // Обновляем слайдер
    if (this.elements.setup.taskCountSlider) {
      this.elements.setup.taskCountSlider.value = count;
    }

    // Обновляем активный пресет
    this.updateActivePreset(count);
  }

  // Обновление активного пресета
  updateActivePreset(count) {
    if (!this.elements.setup.presetBtns) return;

    this.elements.setup.presetBtns.forEach((btn) => {
      const btnCount = parseInt(btn.dataset.count);
      if (btnCount === count) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  // Валидация диапазона сложности
  validateDifficultyRange() {
    if (
      !this.elements.setup.difficultyFrom ||
      !this.elements.setup.difficultyTo
    )
      return;

    const from = parseInt(this.elements.setup.difficultyFrom.value);
    const to = parseInt(this.elements.setup.difficultyTo.value);

    if (from > to) {
      this.elements.setup.difficultyTo.value = from;
    }
  }

  // Переключение экранов
  switchScreen(screen) {
    if (!this.elements.screens.setup || !this.elements.screens.marathon) return;

    this.elements.screens.setup.classList.remove("active");
    this.elements.screens.marathon.classList.remove("active");
    this.elements.screens[screen].classList.add("active");
    this.currentScreen = screen;
    // 🔥 СБРАСЫВАЕМ СКРОЛЛ ПРИ ПЕРЕКЛЮЧЕНИИ
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // 'smooth' если хотите с анимацией
    });
    
    // Для мобильных устройств - скролл самого экрана
    if (this.elements.screens[screen]) {
        this.elements.screens[screen].scrollTop = 0;
    }
  }
initMobileHeader() {
    const header = document.querySelector('.marathon-header-fixed');
    if (!header) return;
    
    let lastScrollTop = 0;
    const scrollThreshold = 10; // Минимальное движение для срабатывания
    
    window.addEventListener('scroll', () => {
        // Только на мобильных устройствах
        if (window.innerWidth > 768) return;
        
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Скролл вниз
        if (currentScroll > lastScrollTop + scrollThreshold) {
            header.classList.add('header-hidden');
        } 
        // Скролл вверх
        else if (currentScroll < lastScrollTop - scrollThreshold) {
            header.classList.remove('header-hidden');
        }
        
        // Если в самом верху - всегда показываем
        if (currentScroll <= 0) {
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = currentScroll;
    });
}
  // Загрузка тегов
  async loadTopics() {
    try {
      this.showLoading();
      const response = await fetch(CONFIG.DATA_PATHS.INDEX);
      const data = await response.json();
      this.topics = data.topics;

      if (this.elements.setup.tagsContainer) {
        this.elements.setup.tagsContainer.innerHTML = "";
        this.topics.forEach((topic) => {
          const checkbox = this.createTagCheckbox(topic);
          this.elements.setup.tagsContainer.appendChild(checkbox);
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки тем:", error);
      this.showError("Не удалось загрузить темы заданий");
    } finally {
      this.hideLoading();
    }
  }

  // Создание checkbox для тега
  createTagCheckbox(topic) {
    const wrapper = document.createElement("label");
    wrapper.className = "tag-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = topic.tag;
    checkbox.dataset.file = topic.file;
    checkbox.addEventListener("change", () => {
      this.updateTagStyle(wrapper, checkbox.checked);
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(document.createTextNode(topic.name));

    return wrapper;
  }

  // Обновление стиля тега
  updateTagStyle(wrapper, isChecked) {
    if (isChecked) {
      wrapper.classList.add("selected");
    } else {
      wrapper.classList.remove("selected");
    }
  }

  // Выбрать все теги
  selectAllTags() {
    if (!this.elements.setup.tagsContainer) return;

    const checkboxes = this.elements.setup.tagsContainer.querySelectorAll(
      'input[type="checkbox"]',
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
      const wrapper = checkbox.closest(".tag-checkbox");
      this.updateTagStyle(wrapper, true);
    });
  }

  // Снять все теги
  deselectAllTags() {
    if (!this.elements.setup.tagsContainer) return;

    const checkboxes = this.elements.setup.tagsContainer.querySelectorAll(
      'input[type="checkbox"]',
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
      const wrapper = checkbox.closest(".tag-checkbox");
      this.updateTagStyle(wrapper, false);
    });
  }

  // Добавление случайного тега
  addRandomTag() {
    if (
      !this.topics ||
      this.topics.length === 0 ||
      !this.elements.setup.tagsContainer
    )
      return;

    const checkboxes = Array.from(
      this.elements.setup.tagsContainer.querySelectorAll(
        'input[type="checkbox"]',
      ),
    );
    const uncheckedBoxes = checkboxes.filter((cb) => !cb.checked);

    if (uncheckedBoxes.length === 0) {
      this.showMessage("Все теги уже выбраны");
      return;
    }

    const randomIndex = Math.floor(Math.random() * uncheckedBoxes.length);
    const randomCheckbox = uncheckedBoxes[randomIndex];

    randomCheckbox.checked = true;
    const wrapper = randomCheckbox.closest(".tag-checkbox");
    this.updateTagStyle(wrapper, true);
  }

  // Получение выбранных тегов
  getSelectedTags() {
    if (!this.elements.setup.tagsContainer) return [];

    const checkboxes = this.elements.setup.tagsContainer.querySelectorAll(
      'input[type="checkbox"]:checked',
    );
    return Array.from(checkboxes).map((cb) => ({
      tag: cb.value,
      file: cb.dataset.file,
    }));
  }

  // Очистка истории
  clearHistory() {
    if (confirm("Вы уверены, что хотите очистить всю историю марафонов?")) {
      storage.clearHistory();
      this.loadHistory();
      this.showMessage("История успешно очищена");
    }
  }

  // Загрузка истории
  loadHistory() {
    const history = storage.loadHistory();
    this.renderHistory(history);
  }

  // Отображение истории
  renderHistory(history) {
    const container = this.elements.setup.historyList;
    if (!container) return;

    container.innerHTML = "";

    if (history.length === 0) {
      container.innerHTML = '<p class="no-history">История пока пуста</p>';
      return;
    }

    history.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.dataset.settings = JSON.stringify(entry.settings);
      item.dataset.taskIds = JSON.stringify(entry.taskIds);

      item.innerHTML = `
                <div class="date">${entry.date}</div>
                <div class="main-info">${entry.lastname}</div>
                <div>Теги: ${entry.tags.join(", ")}</div>
                <div>Сложность: ${entry.difficulty || 1}</div>
                <div>Заданий: ${entry.taskCount} (ID: ${entry.taskIds.join(", ")})</div>
            `;

      item.addEventListener("click", () => this.loadMarathonFromHistory(entry));

      container.appendChild(item);
    });
  }

  // Загрузка марафона из истории
  async loadMarathonFromHistory(entry) {
    try {
        this.showLoading();
        
        const selectedTags = entry.tags.map(tag => ({ tag, file: null }));
        
        selectedTags.forEach(tagItem => {
            const topic = this.topics.find(t => t.tag === tagItem.tag);
            if (topic) {
                tagItem.file = topic.file;
            }
        });
        
        // 🔥 ИСПРАВЛЕНО: передаём ОДНО число difficulty
        const tasks = await marathon.loadTasks(
            selectedTags,
            entry.difficulty || 1,  // Одно число!
            entry.taskCount,
            entry.taskIds
        );
        
        if (tasks && tasks.length > 0) {
            marathon.setTasks(tasks);
            marathon.setCurrentTask(0);
            marathon.setSettings({
                lastname: entry.lastname,
                tags: selectedTags,
                difficulty: entry.difficulty || 1,  // Одно число!
                taskCount: entry.taskCount,
                taskIds: entry.taskIds
            });
            
            this.copiedTasks.clear();
            this.updateMarathonUI();
            this.switchScreen('marathon');
            this.closeInstruction();
        }
    } catch (error) {
        console.error('Ошибка загрузки марафона из истории:', error);
        this.showError('Не удалось загрузить марафон из истории');
    } finally {
        this.hideLoading();
    }
}

  // Загрузка последних настроек - ИСПРАВЛЕНО!
  loadLastSettings() {
    this.deselectAllTags();
    
    const settings = storage.loadLastSettings();
    if (settings) {
        if (this.elements.setup.lastname) {
            this.elements.setup.lastname.value = settings.lastname || '';
        }
        
        // Восстанавливаем сложность
        if (settings.difficulty && this.elements.setup.difficultyBtns) {
            this.setDifficulty(settings.difficulty);
        } else {
            // По умолчанию сложность 1
            this.setDifficulty(CONFIG.DEFAULTS.DIFFICULTY || 1);
        }
        
        // Восстанавливаем количество заданий
        if (settings.taskCount) {
            this.updateTaskCount(settings.taskCount);
        }
        
        // Восстанавливаем теги
        if (settings.tags && settings.tags.length > 0 && this.elements.setup.tagsContainer) {
            setTimeout(() => {
                settings.tags.forEach(tagInfo => {
                    const checkbox = Array.from(this.elements.setup.tagsContainer.querySelectorAll('input[type="checkbox"]'))
                        .find(cb => cb.value === tagInfo.tag);
                    
                    if (checkbox) {
                        checkbox.checked = true;
                        const wrapper = checkbox.closest('.tag-checkbox');
                        this.updateTagStyle(wrapper, true);
                    }
                });
            }, 100);
        }
    } else {
        // Если нет настроек, ставим сложность 1
        this.setDifficulty(CONFIG.DEFAULTS.DIFFICULTY || 1);
    }
}
  // Начать марафон - добавим уведомление если заданий меньше чем запрошено
  async startMarathon() {
    if (!this.elements.setup.lastname || !this.elements.setup.lastname.value.trim()) {
        this.showError('Введите фамилию');
        return;
    }
    
    const selectedTags = this.getSelectedTags();
    if (selectedTags.length === 0) {
        this.showError('Выберите хотя бы один тег');
        return;
    }
    
    // Получаем выбранную сложность
    const difficulty = parseInt(this.elements.setup.selectedDifficulty?.value || 1);
    
    try {
        this.showLoading();
        
        const settings = {
            lastname: this.elements.setup.lastname.value.trim(),
            tags: selectedTags,
            difficulty: difficulty,  // Одно число!
            taskCount: parseInt(this.elements.setup.taskCountValue?.textContent || CONFIG.DEFAULTS.TASK_COUNT)
        };
        
        // 🔥 ПРОВЕРЯЕМ статистику с одним параметром
        const stats = await taskManager.getTasksStats(
            settings.tags,
            settings.difficulty  // Только одно число!
        );
        
        if (stats && stats.total === 0) {
            this.showError(`Нет заданий ${difficulty} уровня сложности для выбранных тегов`);
            return;
        }
        
        if (stats && stats.total < settings.taskCount) {
            const confirmMessage = 
                `⚠️ Для ${difficulty} уровня доступно только ${stats.total} заданий.\n\n` +
                `По тегам:\n${
                    stats.byTag.map(s => `  • ${s.tag}: ${s.available} заданий`).join('\n')
                }\n\n` +
                `Хотите продолжить с ${stats.total} заданиями?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }
            settings.taskCount = stats.total;
            this.updateTaskCount(stats.total);
        }
        
        // 🔥 ЗАГРУЖАЕМ задания с одним параметром
        const tasks = await marathon.loadTasks(
            settings.tags,
            settings.difficulty,  // Одно число!
            settings.taskCount
        );
        
        if (tasks && tasks.length > 0) {
            marathon.setTasks(tasks);
            marathon.setCurrentTask(0);
            marathon.setSettings(settings);
            
            const taskIds = tasks.map(t => t.id);
            storage.addHistoryEntry({
                lastname: settings.lastname,
                tags: settings.tags.map(t => t.tag),
                difficulty: settings.difficulty,  // Одно число!
                taskCount: tasks.length,
                taskIds: taskIds,
                date: new Date().toLocaleString()
            });
            
            storage.saveLastSettings(settings);
            
            this.updateMarathonUI();
            this.switchScreen('marathon');
            this.resetScroll();
            this.loadHistory();
        }
    } catch (error) {
        console.error('Ошибка запуска марафона:', error);
        this.showError('Не удалось загрузить задания');
    } finally {
        this.hideLoading();
    }
}
// Сброс скролла везде
resetScroll() {
    // 1. Основное окно
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'  // Мгновенно, без анимации
    });
    
    // 2. Все экраны
    if (this.elements.screens.setup) {
        this.elements.screens.setup.scrollTop = 0;
    }
    if (this.elements.screens.marathon) {
        this.elements.screens.marathon.scrollTop = 0;
    }
    
    // 3. Контейнер заданий
    const taskContainer = document.querySelector('.task-container');
    if (taskContainer) {
        taskContainer.scrollTop = 0;
    }
    
    // 4. Контейнер истории
    const historyList = document.querySelector('.history-list');
    if (historyList) {
        historyList.scrollTop = 0;
    }
    
    // 5. Фиксированный хедер (сбрасываем его состояние)
    const header = document.querySelector('.marathon-header-fixed');
    if (header) {
        header.classList.remove('header-hidden');
    }
    
    // 6. Модальные окна
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal) {
            modal.scrollTop = 0;
        }
    });
    
    // 7. Body и HTML
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    console.log('🔄 Скролл сброшен');
}
  // Новый метод для обработки нажатия на следующее задание
handleNextTask() {
    const currentIndex = marathon.getCurrentIndex();
    const totalTasks = marathon.getTotalTasks();
    const task = marathon.getCurrentTask();
    
    // Если это не последнее задание
    if (currentIndex < totalTasks - 1) {
        // 🔥 ПРОВЕРКА: мобильное устройство или десктоп
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 📱 На мобильных - сразу переходим без проверки
            console.log('Мобильное устройство: переход без проверки');
            marathon.nextTask();
        } else {
            // 💻 На десктопе - проверяем копирование
            if (task && this.copiedTasks.has(task.id)) {
                this.showInstruction(true);
            } else {
                this.showInstruction(false);
            }
        }
    } else {
        // Последнее задание - просто переходим
        marathon.nextTask();
    }
}

  // Показать инструкцию (с параметром wasCopied)
  showInstruction(wasCopied = false) {
    const task = marathon.getCurrentTask();
    const currentIndex = marathon.getCurrentIndex();
    const totalTasks = marathon.getTotalTasks();

    if (
      !task ||
      !this.elements.instruction.modal ||
      !this.elements.instruction.codeExample
    )
      return;

    // Обновляем пример кода в инструкции
    const codeExample = `//ЗАДАНИЕ ${currentIndex + 1} из ${totalTasks} (ID:${task.id})
/*
Ваш код решения
*/`;

    this.elements.instruction.codeExample.textContent = codeExample;

    // Обновляем UI в зависимости от того, копировали задание или нет
    this.updateInstructionUI(wasCopied);

    // Показываем модальное окно
    this.elements.instruction.modal.style.display = "block";
  }

  // Обновление UI инструкции
  updateInstructionUI(wasCopied = false) {
    const task = marathon.getCurrentTask();
    if (
      !task ||
      !this.elements.instruction.copyBtn ||
      !this.elements.instruction.copyAndContinueBtn ||
      !this.elements.instruction.skipBtn ||
      !this.elements.instruction.alreadyCopiedMessage
    )
      return;

    const isCopied = this.copiedTasks.has(task.id) || wasCopied;
    const copyBtn = this.elements.instruction.copyBtn;
    const continueBtn = this.elements.instruction.copyAndContinueBtn;
    const skipBtn = this.elements.instruction.skipBtn;
    const message = this.elements.instruction.alreadyCopiedMessage;

    if (isCopied) {
      // Задание уже копировали - скрываем кнопку копирования, показываем сообщение
      copyBtn.style.display = "none";
      continueBtn.style.display = "flex";
      continueBtn.innerHTML = "✓ Продолжить →";
      skipBtn.style.display = "none";
      message.style.display = "block";
      message.innerHTML = "✅ Вы уже копировали это задание. Можно продолжить!";
    } else {
      // Задание еще не копировали - показываем всё
      copyBtn.style.display = "flex";
      copyBtn.classList.remove("copied");
      copyBtn.innerHTML = "📋 Копировать задание";
      continueBtn.style.display = "flex";
      continueBtn.innerHTML = "✓ Скопировано, продолжаем!";
      skipBtn.style.display = "flex";
      message.style.display = "none";
    }
  }

  // Обновленный метод copyCurrentTask
  copyCurrentTask() {
    const task = marathon.getCurrentTask();
    if (!task) return;

    const comment = this.formatTaskAsComment(task);

    navigator.clipboard
      .writeText(comment)
      .then(() => {
        // Добавляем задание в множество скопированных
        this.copiedTasks.add(task.id);

        this.showCopyNotification();
        this.animateCopyButton();

        // Обновляем кнопку в инструкции, если она открыта
        this.updateInstructionUI(true);

        // Обновляем кнопку в хедере
        const headerCopyBtn = this.elements.marathon.copyBtn;
        if (headerCopyBtn) {
          headerCopyBtn.classList.add("copied");
          headerCopyBtn.innerHTML = "✅ Скопировано!";
          setTimeout(() => {
            headerCopyBtn.classList.remove("copied");
            headerCopyBtn.innerHTML = "📋 Копировать задание";
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Ошибка копирования:", err);
        this.showError("Не удалось скопировать задание");
      });
  }

  // Форматирование задания в виде комментария
  formatTaskAsComment(task) {
    const currentIndex = marathon.getCurrentIndex();
    const totalTasks = marathon.getTotalTasks();
    const separator = "==========================================";
    const lines = [];

    lines.push(`// ${separator}`);
    lines.push(
      `//ЗАДАНИЕ ${currentIndex + 1} из ${totalTasks} (ID:${task.id}): ${task.title || "Без названия"}`,
    );
    lines.push(`// ${task.description.replace(/\n/g, "\n// ")}`);
    lines.push(`// ТРЕБОВАНИЯ:`);

    if (task.requirements && task.requirements.length > 0) {
      task.requirements.forEach((req, index) => {
        lines.push(`// ${index + 1}. ${req}`);
      });
    } else {
      lines.push(`// Нет требований`);
    }

    lines.push(`// ${separator}`);
    lines.push(``);

    return lines.join("\n");
  }

  // Показать уведомление о копировании
  showCopyNotification() {
    // Удаляем предыдущее уведомление если есть
    const oldNotification = document.querySelector(".copy-notification");
    if (oldNotification) {
      oldNotification.remove();
    }

    // Создаем новое уведомление
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = "✅ Задание скопировано в буфер обмена!";

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Анимация кнопки после копирования
  animateCopyButton() {
    const btn = this.elements.marathon.copyBtn;
    if (!btn) return;

    btn.classList.add("copied");
    btn.innerHTML = "✅ Скопировано!";

    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = "📋 Копировать задание";
    }, 2000);
  }

  // Закрыть инструкцию
  closeInstruction() {
    if (this.elements.instruction.modal) {
      this.elements.instruction.modal.style.display = "none";
    }
  }

  // Обновление UI марафона
  updateMarathonUI() {
    const task = marathon.getCurrentTask();
    const currentIndex = marathon.getCurrentIndex();
    const totalTasks = marathon.getTotalTasks();

    if (!task) return;

    // Обновляем индикатор задания
    if (this.elements.marathon.currentTaskIndicator) {
      this.elements.marathon.currentTaskIndicator.textContent = `Задание ${currentIndex + 1} из ${totalTasks}`;
    }

    // Обновляем заголовок с номером марафона и ID
    if (this.elements.marathon.taskTitle) {
      const titleElement = this.elements.marathon.taskTitle;
      titleElement.textContent = `Задание ${currentIndex + 1} из ${totalTasks}: ${task.title || "Без названия"}`;
      titleElement.setAttribute("data-id", task.id);
      titleElement.setAttribute("title", `ID задания: ${task.id}`);
    }

    // Обновляем описание
    if (this.elements.marathon.taskDescription) {
      this.elements.marathon.taskDescription.innerHTML = this.formatText(
        task.description || "Описание отсутствует",
      );
    }

    // Обновляем требования
    const requirements = task.requirements || [];
    this.renderRequirements(requirements);

    // Обновляем подсказку
    if (this.elements.marathon.hintText) {
      this.elements.marathon.hintText.textContent =
        task.hint || "Подсказка отсутствует";
    }

    // Обновляем пример вывода
    if (this.elements.marathon.consoleOutput) {
      this.elements.marathon.consoleOutput.textContent =
        task.exampleConsoleOutput || "// Пример вывода отсутствует";
    }

    // Обновляем состояние кнопок навигации
    if (this.elements.marathon.prevBtn) {
      this.elements.marathon.prevBtn.disabled = currentIndex === 0;
    }
    if (this.elements.marathon.nextBtn) {
      this.elements.marathon.nextBtn.disabled = currentIndex === totalTasks - 1;
    }

    // Сбрасываем кнопку копирования в хедере
    const copyBtn = this.elements.marathon.copyBtn;
    if (copyBtn) {
      copyBtn.classList.remove("copied");
      copyBtn.innerHTML = "📋 Копировать задание";
    }

    // Закрываем инструкцию при смене задания
    this.closeInstruction();

    // Обновляем документацию
    docManager.loadMaterials(marathon.getSelectedTags());
  }

  // Форматирование текста
  formatText(text) {
    return text.replace(/\n/g, "<br>");
  }

  // Отображение требований
  renderRequirements(requirements) {
    const list = this.elements.marathon.requirementsList;
    if (!list) return;

    list.innerHTML = "";

    if (requirements.length === 0) {
      list.innerHTML = "<li>Нет требований</li>";
      return;
    }

    requirements.forEach((req) => {
      const li = document.createElement("li");
      li.textContent = req;
      list.appendChild(li);
    });
  }

  // Показать загрузку
  showLoading() {
    this.isLoading = true;
  }

  // Скрыть загрузку
  hideLoading() {
    this.isLoading = false;
  }

  // Показать ошибку
  showError(message) {
    alert(message);
  }

  // Показать сообщение
  showMessage(message) {
    alert(message);
  }
}

export const ui = new UIManager();
