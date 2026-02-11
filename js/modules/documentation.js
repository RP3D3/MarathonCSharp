import { CONFIG } from './config.js';
import { taskManager } from './tasks.js';

// Управление документацией
class DocumentationManager {
    constructor() {
        this.modal = document.getElementById('doc-modal');
        this.content = document.getElementById('doc-content');
        this.currentTags = [];
    }
    
    // Загрузка материалов для тегов
    async loadMaterials(tags) {
        this.currentTags = tags;
        if (!this.modal.classList.contains('show')) {
            // Не обновляем, если модалка не открыта
            return;
        }
        
        await this.renderMaterials();
    }
    
    // Отображение материалов
    async renderMaterials() {
        if (!this.content) return;
        
        try {
            const materialsData = await taskManager.findMaterialsByTags(this.currentTags);
            
            if (materialsData.length === 0) {
                this.content.innerHTML = `
                    <p>Нет документации для выбранных тегов.</p>
                    <p>Рекомендуем посмотреть:</p>
                    ${this.generateDefaultLinks()}
                `;
                return;
            }
            
            let html = '';
            
            materialsData.forEach(tagData => {
                html += `<h3>${tagData.tag}</h3>`;
                html += '<div class="materials-list">';
                
                tagData.materials.forEach(material => {
                    html += `
                        <a href="${material.url}" target="_blank" class="material-link">
                            <span class="material-title">${material.title}</span>
                            <span class="material-desc">${material.description}</span>
                        </a>
                    `;
                });
                
                html += '</div>';
            });
            
            this.content.innerHTML = html;
            
        } catch (error) {
            console.error('Ошибка загрузки материалов:', error);
            this.content.innerHTML = `
                <p>Ошибка загрузки документации.</p>
                ${this.generateDefaultLinks()}
            `;
        }
    }
    
    // Генерация ссылок по умолчанию
    generateDefaultLinks() {
        let html = '<div class="materials-list">';
        
        this.currentTags.forEach(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.tag;
            const url = this.getMetanitUrl(tagName);
            
            html += `
                <a href="${url}" target="_blank" class="material-link">
                    <span class="material-title">${tagName}</span>
                    <span class="material-desc">Metanit - C# ${tagName}</span>
                </a>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    // Получение URL на Metanit
    getMetanitUrl(tag) {
        const normalizedTag = tag.toLowerCase().trim();
        const section = CONFIG.DOCS_SECTIONS[normalizedTag];
        
        if (section) {
            return `${CONFIG.DOCS_BASE_URL}${section}`;
        }
        
        // По умолчанию возвращаем на главную
        return CONFIG.DOCS_BASE_URL;
    }
    
    // Открыть модальное окно
    async openModal() {
        this.modal.style.display = 'block';
        await this.renderMaterials();
    }
    
    // Закрыть модальное окно
    closeModal() {
        this.modal.style.display = 'none';
    }
}

export const docManager = new DocumentationManager();