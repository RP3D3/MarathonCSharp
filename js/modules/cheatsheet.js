// js/modules/cheatsheet.js
import { CONFIG } from "./config.js";

class CheatSheetManager {
  constructor() {
    this.modal = document.getElementById("cheatsheet-modal");
    this.titleEl = document.getElementById("cheatsheet-title");
    this.bodyEl = document.getElementById("cheatsheet-body");
    this.closeBtn = document.querySelector(".cheatsheet-close");
    this.cheatSheetsData = null;
    this.previousState = null;
  }

  async init() {
    await this.loadCheatSheets();
    this.attachEvents();
  }

  async loadCheatSheets() {
    try {
      const response = await fetch("./js/data/cheatsheets.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.cheatSheetsData = await response.json();
      console.log("✅ Шпаргалки загружены");
    } catch (error) {
      console.error("❌ Ошибка загрузки шпаргалок:", error);
      this.cheatSheetsData = { cheatSheets: [] };
    }
  }

  attachEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  // Главный метод открытия
  openForTag(tags) {
    // В методе openForTag или после рендера
    const goToAllBtn = document.getElementById("go-to-all-topics");
    if (goToAllBtn) {
      goToAllBtn.addEventListener("click", () => {
        // Сохраняем состояние
        const currentTags = Array.from(
          document.querySelectorAll(".cheatsheet-tab:not(.plus-tab)"),
        ).map((tab) => tab.dataset.tab);

        this.previousState = {
          type: "multi-tag",
          tags: currentTags,
          activeTab: document.querySelector(".cheatsheet-tab.active")?.dataset
            .tab,
        };

        // Показываем все темы
        const allTopics =
          this.cheatSheetsData?.cheatSheets?.map((s) => ({
            tag: s.tag,
            title: s.title,
          })) || [];

        this.bodyEl.innerHTML = this.renderAllTopics(allTopics);
        this.titleEl.textContent = "📚 Все темы";

        setTimeout(() => this.initTopicCards(), 50);
      });
    }

    // Если пришёл один тег (строка), превращаем в массив
    if (typeof tags === "string") {
      tags = [tags];
    }

    if (!tags || tags.length === 0) {
      this.bodyEl.innerHTML = '<p class="no-data">❌ Нет выбранных тегов</p>';
      this.modal.style.display = "block";
      return;
    }

    if (!this.cheatSheetsData || !this.cheatSheetsData.cheatSheets) {
      this.bodyEl.innerHTML =
        '<p class="no-data">📚 Шпаргалки ещё не загрузились</p>';
      this.modal.style.display = "block";
      return;
    }

    // Обновляем заголовок
    this.titleEl.textContent = "📘 Шпаргалка";

    // Если несколько тегов - показываем с вкладками
    this.renderMultiTagCheatSheet(tags);
    this.modal.style.display = "block";
  }

  // Рендер одной шпаргалки
  renderCheatSheet(sheet) {
    let html = "";

    sheet.sections.forEach((section) => {
      html += `<div class="cheatsheet-section">`;
      html += `<h3>${section.title}</h3>`;

      if (section.content) {
        html += `<p>${section.content}</p>`;
      }

      if (section.codeBlocks) {
        section.codeBlocks.forEach((block) => {
          if (block.description) {
            html += `<p class="code-description">💡 ${block.description}</p>`;
          }
          html += `<pre class="code-block"><code class="language-csharp">${this.escapeHtml(block.code)}</code></pre>`;
        });
      }

      html += `</div>`;
    });

    this.bodyEl.innerHTML = html;

    // Подсветка синтаксиса
    if (window.hljs) {
      document
        .querySelectorAll(
          ".cheatsheet-tab-pane.active pre code, .cheatsheet-section pre code",
        )
        .forEach((block) => {
          hljs.highlightElement(block);
        });
    }
  }

  // Новый метод для отображения нескольких шпаргалок с вкладками
  renderMultiTagCheatSheet(tags) {
    console.log("🎨 renderMultiTagCheatSheet с тегами:", tags);
    setTimeout(() => this.resetModalScroll(), 20);
    // Получаем все темы
    const allTopics =
      this.cheatSheetsData?.cheatSheets?.map((s) => ({
        tag: s.tag,
        title: s.title,
      })) || [];

    // Находим существующие шпаргалки
    const availableSheets = tags
      .map((tag) =>
        this.cheatSheetsData?.cheatSheets?.find((s) => s.tag === tag),
      )
      .filter((sheet) => sheet !== undefined);

    // НАЧИНАЕМ СТРОИТЬ ИНТЕРФЕЙС
    let html = "";

    // ===== ВКЛАДКИ =====
    html += '<div class="cheatsheet-tabs">';

    // Добавляем вкладки для существующих шпаргалок
    availableSheets.forEach((sheet, index) => {
      html += `
            <button class="cheatsheet-tab ${index === 0 ? "active" : ""}" 
                    data-sheet-index="${index}">
                ${sheet.title}
            </button>
        `;
    });

    // ВСЕГДА добавляем кнопку "Все темы"
    html += `
        <button class="cheatsheet-tab plus-tab" id="all-topics-btn">
            📚 Все темы
        </button>
    `;

    html += "</div>"; // Закрываем вкладки

    // ===== КОНТЕНТ =====
    html += '<div class="cheatsheet-content">';

    // Контент для существующих шпаргалок (прячем неактивные через CSS)
    availableSheets.forEach((sheet, index) => {
      const displayStyle = index === 0 ? "block" : "none";
      html += `<div class="cheatsheet-pane" data-pane-index="${index}" style="display: ${displayStyle};">`;

      // Рендерим секции
      sheet.sections.forEach((section) => {
        html += `<div class="cheatsheet-section">`;
        html += `<h3>${section.title}</h3>`;

        if (section.content) {
          html += `<p>${section.content}</p>`;
        }

        if (section.codeBlocks) {
          section.codeBlocks.forEach((block) => {
            if (block.description) {
              html += `<p class="code-description">💡 ${block.description}</p>`;
            }
            html += `<pre class="code-block"><code class="language-csharp">${this.escapeHtml(block.code)}</code></pre>`;
          });
        }

        html += `</div>`;
      });

      html += `</div>`;
    });

    // Контент для "Все темы" (скрыт по умолчанию)
    html += `<div class="cheatsheet-pane" id="all-topics-pane" style="display: none;">`;
    html += this.renderAllTopics(allTopics);
    html += `</div>`;

    html += "</div>"; // Закрываем контент

    // Вставляем в DOM
    this.bodyEl.innerHTML = html;

    // ===== ОБРАБОТЧИКИ =====

    // Переключение между вкладками шпаргалок
    document
      .querySelectorAll(".cheatsheet-tab:not(.plus-tab)")
      .forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const index = e.target.dataset.sheetIndex;

          // Убираем active со всех вкладок
          document
            .querySelectorAll(".cheatsheet-tab")
            .forEach((t) => t.classList.remove("active"));

          // Активируем текущую вкладку
          e.target.classList.add("active");

          // Прячем все панели
          document
            .querySelectorAll(".cheatsheet-pane")
            .forEach((p) => (p.style.display = "none"));

          // Показываем нужную панель
          document.querySelector(`[data-pane-index="${index}"]`).style.display =
            "block";

          // Обновляем заголовок
          const sheet = availableSheets[index];
          if (sheet) {
            this.titleEl.textContent = `📘 ${sheet.title}`;
          }

          // Подсветка кода
          setTimeout(() => {
            if (window.hljs) {
              document
                .querySelectorAll(`[data-pane-index="${index}"] pre code`)
                .forEach((block) => {
                  hljs.highlightElement(block);
                });
            }
          }, 20);
        });
      });

    // Обработчик для кнопки "Все темы"
    document.getElementById("all-topics-btn")?.addEventListener("click", () => {
      // Убираем active со всех вкладок
      document
        .querySelectorAll(".cheatsheet-tab")
        .forEach((t) => t.classList.remove("active"));
      setTimeout(() => this.resetModalScroll(), 50);

      // Активируем кнопку "Все темы"
      document.getElementById("all-topics-btn").classList.add("active");

      // Прячем все панели
      document
        .querySelectorAll(".cheatsheet-pane")
        .forEach((p) => (p.style.display = "none"));

      // Показываем панель со всеми темами
      document.getElementById("all-topics-pane").style.display = "block";

      // Меняем заголовок
      this.titleEl.textContent = "📚 Все темы";

      // Инициализируем карточки
      setTimeout(() => this.initTopicCards(), 50);
    });

    // Если нет ни одной шпаргалки, сразу показываем "Все темы"
    if (availableSheets.length === 0) {
      document.getElementById("all-topics-btn").click();
    }

    // Заголовок по умолчанию
    if (availableSheets.length > 0) {
      this.titleEl.textContent = `📘 ${availableSheets[0].title}`;
    }

    // Подсветка кода в первой вкладке
    setTimeout(() => {
      if (window.hljs && availableSheets.length > 0) {
        document
          .querySelectorAll('[data-pane-index="0"] pre code')
          .forEach((block) => {
            hljs.highlightElement(block);
          });
      }
    }, 50);
  }

  // Новый метод для рендера контента шпаргалки
  renderSheetContent(sheet) {
    let html = "";

    sheet.sections.forEach((section) => {
      html += `<div class="cheatsheet-section">`;
      html += `<h3>${section.title}</h3>`;

      if (section.content) {
        html += `<p>${section.content}</p>`;
      }

      if (section.codeBlocks) {
        section.codeBlocks.forEach((block) => {
          if (block.description) {
            html += `<p class="code-description">💡 ${block.description}</p>`;
          }
          html += `<pre class="code-block"><code class="language-csharp">${this.escapeHtml(block.code)}</code></pre>`;
        });
      }

      html += `</div>`;
    });

    return html;
  }

  // Новый метод для сообщения об отсутствии шпаргалки
  renderMissingTagMessage(tag) {
    return `
        <div class="missing-tag-message">
            <div class="missing-icon">⚠️</div>
            <h3>Шпаргалка для "${tag}" пока не готова</h3>
            <p>Но вы можете:</p>
            <ul>
                <li>📚 Посмотреть другие темы через кнопку "Все темы"</li>
                <li>💡 Спросить у преподавателя</li>
                <li>🔍 Поискать в интернете</li>
            </ul>
            <button class="btn btn-primary" id="go-to-all-topics">
                Перейти ко всем темам
            </button>
        </div>
    `;
  }
  returnToTabs() {
    console.log("🔄 Возврат к вкладкам");

    if (this.previousState && this.previousState.type === "multi-tag") {
      // Восстанавливаем вид с вкладками
      this.renderMultiTagCheatSheet(this.previousState.tags);

      // Восстанавливаем активную вкладку
      setTimeout(() => {
        if (this.previousState.activeTab) {
          const tabToActivate = document.querySelector(
            `.cheatsheet-tab[data-tab="${this.previousState.activeTab}"]`,
          );
          if (tabToActivate) {
            tabToActivate.click();
          }
        }
      }, 50);
    } else {
      // Если нет сохраненного состояния, показываем все темы из текущего марафона
      import("./ui.js").then((module) => {
        const tags = module.ui?.marathon?.getSelectedTags?.() || [];
        const tagNames = tags.map((t) => t.tag);
        this.renderMultiTagCheatSheet(tagNames);
      });
    }

    this.titleEl.textContent = "📘 Шпаргалка";
  }
  // Новый метод для отображения всех тем
  renderAllTopics(topics) {
    if (!topics || topics.length === 0) {
      return '<p class="no-data">📚 Нет доступных тем</p>';
    }

    let html = `
        <div class="all-topics-header">
            <h3>Выберите тему для изучения:</h3>
            <p class="topics-count">Всего <span id="topics-total">${topics.length}</span> тем</p>
            
            <!-- 🔍 ПОЛЕ ПОИСКА -->
            <div class="search-container">
                <input type="text" 
                       id="topic-search" 
                       class="topic-search" 
                       placeholder="🔍 Поиск по темам..." 
                       autocomplete="off">
                <span class="search-clear" id="search-clear">✕</span>
            </div>
        </div>
        
        <!-- СЧЁТЧИК НАЙДЕННЫХ -->
        <div class="search-results-info" id="search-results-info">
            Найдено: <span id="found-count">${topics.length}</span>
        </div>
        
        <div class="all-topics-grid" id="topics-grid">
    `;

    topics.forEach((topic) => {
      html += `
            <div class="topic-card" data-tag="${topic.tag}" data-title="${topic.title.toLowerCase()}">
                <div class="topic-icon">📘</div>
                <h4>${topic.title}</h4>
                <p class="topic-description">Нажмите, чтобы открыть</p>
            </div>
        `;
    });

    html += "</div>";

    return html;
  }
  initTopicCards() {
    console.log("🔍 Инициализация карточек тем и поиска");

    // Карточки
    document.querySelectorAll(".topic-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const tag = e.currentTarget.dataset.tag;

        // Визуальный отклик
        card.style.transform = "scale(0.98)";
        setTimeout(() => (card.style.transform = ""), 200);

        // Сохраняем состояние
        this.previousState = {
          type: "all-topics",
          fromAllTopics: true,
        };

        this.openTopic(tag);
        setTimeout(() => this.resetModalScroll(), 50);
      });
    });

    // 🔍 ИНИЦИАЛИЗАЦИЯ ПОИСКА
    this.initSearch();
  }
showSimpleNoResults(isEmpty, searchTerm) {
    const grid = document.getElementById('topics-grid');
    if (!grid) return;
    
    let noResults = document.querySelector('.no-search-results');
    
    if (isEmpty && searchTerm !== '') {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-search-results';
            noResults.innerHTML = `
                <span style="font-size: 48px; display: block; margin-bottom: 20px;">🔍</span>
                <h3>Ничего не найдено</h3>
                <p>По запросу "<strong>${searchTerm}</strong>" нет тем</p>
                <button class="btn btn-primary" id="clear-search-btn" 
                        style="margin-top: 20px; padding: 10px 30px;">
                    Очистить поиск
                </button>
            `;
            grid.appendChild(noResults);
            
            document.getElementById('clear-search-btn')?.addEventListener('click', () => {
                document.getElementById('topic-search').value = '';
                document.getElementById('topic-search').dispatchEvent(new Event('input'));
            });
        } else {
            // Обновляем текст, если сообщение уже есть
            const title = noResults.querySelector('h3');
            const p = noResults.querySelector('p');
            if (title) title.textContent = 'Ничего не найдено';
            if (p) p.innerHTML = `По запросу "<strong>${searchTerm}</strong>" нет тем`;
        }
    } else {
        if (noResults) {
            noResults.remove();
        }
    }
}
  initSearch() {
    const searchInput = document.getElementById('topic-search');
    const searchClear = document.getElementById('search-clear');
    const foundCountSpan = document.getElementById('found-count');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput) return;
    
    console.log('🔍 Инициализация простого поиска по заголовкам');
    
    const filterTopics = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.topic-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
            
            if (searchTerm === '' || title.includes(searchTerm)) {
                card.style.display = '';
                visibleCount++;
                
                // Подсветка при совпадении
                if (searchTerm !== '' && title.includes(searchTerm)) {
                    card.style.border = '2px solid #667eea';
                    card.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.3)';
                } else {
                    card.style.border = '';
                    card.style.boxShadow = '';
                }
            } else {
                card.style.display = 'none';
            }
        });
        
        // Обновляем счётчик
        if (foundCountSpan) {
            foundCountSpan.textContent = visibleCount;
        }
        
        // Показываем/скрываем кнопку очистки
        if (searchContainer) {
            if (searchInput.value.length > 0) {
                searchContainer.classList.add('filled');
            } else {
                searchContainer.classList.remove('filled');
            }
        }
        
        // Показываем сообщение если ничего не найдено
        this.showSimpleNoResults(visibleCount === 0, searchTerm);
    };
    
    // Вешаем обработчик
    searchInput.addEventListener('input', filterTopics);
    
    // Очистка поиска
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            filterTopics();
            searchInput.focus();
        });
    }
    
    // Очистка по Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterTopics();
        }
    });
    
    // Первоначальный запуск
    filterTopics();
}
  // Сброс скролла внутри модального окна
  resetModalScroll() {
    const modalBody = this.bodyEl;
    if (modalBody) {
      // Сбрасываем скролл самого контейнера
      modalBody.scrollTop = 0;
      modalBody.scrollTo({ top: 0, behavior: "smooth" });

      console.log("🔄 Скролл модального окна сброшен");
    }

    // Также сбрасываем скролл у всех внутренних контейнеров
    const scrollableContainers = modalBody.querySelectorAll(
      ".cheatsheet-tabs-content, .all-topics-grid, .cheatsheet-single-topic",
    );
    scrollableContainers.forEach((container) => {
      if (container) {
        container.scrollTop = 0;
      }
    });
  }
  updateSearchStats(totalTopics) {
    const statsHtml = `
        <div class="search-stats">
            <span>📚 Всего тем: ${totalTopics}</span>
            <span>🔍 Поиск по заголовкам, разделам и коду</span>
        </div>
    `;

    const header = document.querySelector(".all-topics-header");
    if (header) {
      header.insertAdjacentHTML("beforeend", statsHtml);
    }
  }
  // 🔍 НЕЧЕТКИЙ ПОИСК (похожие слова)
  fuzzySearch(word, text) {
    if (word.length < 3) return false;

    // Проверяем расстояние Левенштейна (упрощенно)
    const words = text.split(/\s+/);

    for (const w of words) {
      if (w.length < 3) continue;

      // Если слово начинается так же
      if (w.startsWith(word)) return true;

      // Если слово содержит почти все буквы
      let matches = 0;
      for (let i = 0; i < word.length; i++) {
        if (w.includes(word[i])) matches++;
      }

      if (matches / word.length > 0.7) return true;
    }

    return false;
  }

  // Подсветка совпадений
  highlightMatch(card, searchTerm) {
    const title = card.querySelector("h4");
    if (!title) return;

    const originalText = title.textContent;
    const lowerText = originalText.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();

    if (lowerText.includes(lowerSearch)) {
      const index = lowerText.indexOf(lowerSearch);
      const before = originalText.substring(0, index);
      const match = originalText.substring(index, index + searchTerm.length);
      const after = originalText.substring(index + searchTerm.length);

      title.innerHTML = `${before}<span class="highlight">${match}</span>${after}`;
    } else {
      title.innerHTML = originalText;
    }
  }

  // Улучшенное сообщение о результатах
  showSearchResults(isEmpty, searchTerm) {
    const grid = document.getElementById("topics-grid");
    if (!grid) return;

    let noResults = document.querySelector(".no-search-results");

    if (isEmpty) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-search-results";

        // Анализируем поисковый запрос и предлагаем альтернативы
        const suggestions = this.getSearchSuggestions(searchTerm);

        noResults.innerHTML = `
                <span style="font-size: 48px; display: block; margin-bottom: 20px;">🔍</span>
                <h3>Ничего не найдено по запросу "${searchTerm}"</h3>
                <p style="margin: 20px 0;">Попробуйте:</p>
                <ul style="text-align: left; max-width: 300px; margin: 0 auto;">
                    ${suggestions.map((s) => `<li>💡 ${s}</li>`).join("")}
                </ul>
                <button class="btn btn-primary" id="clear-search-btn" 
                        style="margin-top: 30px;">
                    Очистить поиск
                </button>
            `;
        grid.appendChild(noResults);

        document
          .getElementById("clear-search-btn")
          ?.addEventListener("click", () => {
            document.getElementById("topic-search").value = "";
            document
              .getElementById("topic-search")
              .dispatchEvent(new Event("input"));
          });
      }
    } else {
      if (noResults) {
        noResults.remove();
      }
    }
  }

  // Генерация подсказок для поиска
  getSearchSuggestions(searchTerm) {
    const suggestions = [];
    const term = searchTerm.toLowerCase();

    // Словарь синонимов и связанных терминов
    const synonyms = {
      конверт: ["преобразование", "parse", "tryparse", "tostring"],
      массив: ["array", "list", "collection"],
      строка: ["string", "text", "char"],
      число: ["int", "double", "float", "decimal"],
      цикл: ["for", "while", "foreach", "loop"],
      условие: ["if", "else", "switch", "case"],
    };

    // Ищем подходящие синонимы
    for (const [key, values] of Object.entries(synonyms)) {
      if (term.includes(key) || key.includes(term)) {
        suggestions.push(`Попробуйте поискать: ${values.join(", ")}`);
      }
    }

    // Общие советы
    suggestions.push("Используйте более общие термины");
    suggestions.push("Проверьте орфографию");
    suggestions.push("Поиск работает по названиям тем, разделам и описаниям");

    return suggestions.slice(0, 4); // Не больше 4 подсказок
  }
  // Улучшенный поиск с дебаунсом
  initSearchWithDebounce() {
    const searchInput = document.getElementById("topic-search");
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll(".topic-card");
        let visibleCount = 0;

        cards.forEach((card) => {
          const title = card.dataset.title || "";
          const matches = searchTerm === "" || title.includes(searchTerm);
          card.style.display = matches ? "" : "none";
          if (matches) visibleCount++;
        });

        // Обновляем счётчик
        const foundCountSpan = document.getElementById("found-count");
        if (foundCountSpan) {
          foundCountSpan.textContent = visibleCount;
        }

        // Сообщение о пустом результате
        this.showNoResultsMessage(visibleCount === 0);
      }, 300); // Ждём 300мс после последнего ввода
    });
  }
  showNoResultsMessage(show) {
    const grid = document.getElementById("topics-grid");
    if (!grid) return;

    let noResults = document.querySelector(".no-search-results");

    if (show) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-search-results";
        noResults.innerHTML = `
                <span style="font-size: 48px; display: block; margin-bottom: 20px;">🔍</span>
                <p>Ничего не найдено</p>
                <p style="font-size: 14px; margin-top: 10px;">Попробуйте другие ключевые слова</p>
            `;
        grid.appendChild(noResults);
      }
    } else {
      if (noResults) {
        noResults.remove();
      }
    }
  }

  handleTopicClick(e) {
    const card = e.currentTarget;
    const tag = card.dataset.tag;

    console.log("🖱️ Клик по карточке с тегом:", tag);

    // Визуальный отклик
    card.style.transform = "scale(0.98)";
    setTimeout(() => {
      card.style.transform = "";
    }, 200);

    this.openTopic(tag);
  }
  // Метод для открытия конкретной темы
  openTopic(tag) {
    console.log("📂 openTopic вызван с тегом:", tag);
    // 🔥 ПОТОМ сбрасываем скролл (с небольшой задержкой)
            setTimeout(() => {
                this.resetModalScroll();
                console.log('🔄 Скролл сброшен после клика по карточке');
            }, 50);
    const sheet = this.cheatSheetsData?.cheatSheets?.find((s) => s.tag === tag);
    if (sheet) {
        setTimeout(() => this.resetModalScroll(), 50);

      // 🔥 СОХРАНЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ (теги, которые были выбраны)
      const currentTags = Array.from(
        document.querySelectorAll(".cheatsheet-tab:not(.plus-tab)"),
      ).map((tab) => tab.dataset.tab);
      setTimeout(() => this.resetModalScroll(), 20);
      this.previousState = {
        type: "multi-tag",
        tags: currentTags,
        activeTab: document.querySelector(".cheatsheet-tab.active")?.dataset
          .tab,
      };

      console.log("💾 Сохранено предыдущее состояние:", this.previousState);

      // Рендерим выбранную тему
      let html = `
            <button class="back-to-all-btn" id="back-to-previous">
                ← Назад к вкладкам
            </button>
        `;

      // Добавляем контент темы
      html += `<div class="cheatsheet-single-topic">`;

      sheet.sections.forEach((section) => {
        html += `<div class="cheatsheet-section">`;
        html += `<h3>${section.title}</h3>`;

        if (section.content) {
          html += `<p>${section.content}</p>`;
        }

        if (section.codeBlocks) {
          section.codeBlocks.forEach((block) => {
            if (block.description) {
              html += `<p class="code-description">💡 ${block.description}</p>`;
            }
            html += `<pre class="code-block"><code class="language-csharp">${this.escapeHtml(block.code)}</code></pre>`;
          });
        }

        html += `</div>`;
      });

      html += `</div>`;

      this.bodyEl.innerHTML = html;
      this.titleEl.textContent = `📘 ${sheet.title}`;

      // 🔥 КНОПКА ВОЗВРАТА К ПРЕДЫДУЩЕМУ СОСТОЯНИЮ
      document
        .getElementById("back-to-previous")
        ?.addEventListener("click", () => {
          console.log(
            "👈 Возврат к предыдущему состоянию:",
            this.previousState,
          );

          if (this.previousState && this.previousState.type === "multi-tag") {
            // Восстанавливаем вид с вкладками
            this.renderMultiTagCheatSheet(this.previousState.tags);

            // Восстанавливаем активную вкладку
            setTimeout(() => {
              if (this.previousState.activeTab) {
                const tabToActivate = document.querySelector(
                  `.cheatsheet-tab[data-tab="${this.previousState.activeTab}"]`,
                );
                if (tabToActivate) {
                  tabToActivate.click();
                }
              }
            }, 50);
          } else {
            // Если нет сохраненного состояния, показываем все темы
            const allTopics =
              this.cheatSheetsData?.cheatSheets?.map((s) => s.tag) || [];
            this.renderMultiTagCheatSheet(allTopics);
          }

          // Сбрасываем заголовок
          this.titleEl.textContent = "📘 Шпаргалка";
        });

      // Подсветка кода
      setTimeout(() => {
        if (window.hljs) {
          document
            .querySelectorAll(".cheatsheet-single-topic pre code")
            .forEach((block) => {
              hljs.highlightElement(block);
            });
        }
      }, 50);
    }
  }

  // Метод для открытия конкретной темы
  openTopic(tag) {
    const sheet = this.cheatSheetsData.cheatSheets.find((s) => s.tag === tag);
    if (sheet) {
      // Переключаемся на эту тему
      this.renderCheatSheet(sheet);

      // Обновляем заголовок
      this.titleEl.textContent = `📘 ${sheet.title}`;

      // Можно добавить кнопку "Назад ко всем темам"
      const backBtn = document.createElement("button");
      backBtn.className = "back-to-all-btn";
      backBtn.innerHTML = "← Ко всем темам";
      backBtn.onclick = () => {
        // Возвращаемся к мульти-отображению
        const currentTags = Array.from(
          document.querySelectorAll(".cheatsheet-tab:not(.plus-tab)"),
        ).map((tab) => tab.dataset.tab);
        this.renderMultiTagCheatSheet(currentTags);
      };

      this.bodyEl.prepend(backBtn);
    }
  }

  // Инициализация обработчиков вкладок
  initTabHandlers() {
    // Обработчики для обычных вкладок
    document
      .querySelectorAll(".cheatsheet-tab:not(.plus-tab)")
      .forEach((tab) => {
        tab.addEventListener("click", (e) => {
          // Убираем активный класс у всех вкладок и панелей
          document
            .querySelectorAll(".cheatsheet-tab")
            .forEach((t) => t.classList.remove("active"));
          document
            .querySelectorAll(".cheatsheet-tab-pane")
            .forEach((p) => p.classList.remove("active"));

          // Активируем текущую вкладку
          e.target.classList.add("active");

          // Находим соответствующую панель по индексу
          const index = e.target.dataset.index;
          const panes = document.querySelectorAll(".cheatsheet-tab-pane");
          if (panes[index]) {
            panes[index].classList.add("active");

            // Меняем заголовок
            const sheet = this.cheatSheetsData?.cheatSheets?.[index];
            if (sheet) {
              this.titleEl.textContent = `📘 ${sheet.title}`;
            }

            // Подсвечиваем код в новой активной вкладке
            if (window.hljs) {
              setTimeout(() => {
                panes[index].querySelectorAll("pre code").forEach((block) => {
                  hljs.highlightElement(block);
                });
              }, 20);
            }
          }
        });
      });

    // Инициализируем карточки тем
    setTimeout(() => {
      this.initTopicCards();
    }, 100);
  }

  // Экранирование HTML
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  close() {
    this.modal.style.display = "none";
  }
}

export const cheatsheetManager = new CheatSheetManager();
