// Additional components and features

// Photo Gallery Lightbox
class PhotoGallery {
    constructor() {
        this.currentPhoto = 0;
        this.photos = [];
        this.init();
    }
    
    init() {
        // Create lightbox HTML
        const lightbox = document.createElement('div');
        lightbox.className = 'photo-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="photoGallery.close()">&times;</button>
                <button class="lightbox-prev" onclick="photoGallery.prev()">‹</button>
                <button class="lightbox-next" onclick="photoGallery.next()">›</button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .photo-lightbox {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .lightbox-content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .lightbox-image {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                animation: zoomIn 0.3s ease;
            }
            
            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .lightbox-close {
                position: absolute;
                top: 20px;
                right: 40px;
                background: none;
                border: none;
                color: white;
                font-size: 3rem;
                cursor: pointer;
                z-index: 2001;
            }
            
            .lightbox-prev,
            .lightbox-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                font-size: 3rem;
                cursor: pointer;
                padding: 1rem;
                transition: background 0.3s;
            }
            
            .lightbox-prev {
                left: 20px;
            }
            
            .lightbox-next {
                right: 20px;
            }
            
            .lightbox-prev:hover,
            .lightbox-next:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .lightbox-caption {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                font-size: 1.1rem;
                text-align: center;
            }
            
            .lightbox-counter {
                position: absolute;
                top: 20px;
                left: 20px;
                color: white;
                font-size: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    open(photos, index = 0) {
        this.photos = photos;
        this.currentPhoto = index;
        this.update();
        document.querySelector('.photo-lightbox').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        document.querySelector('.photo-lightbox').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    next() {
        this.currentPhoto = (this.currentPhoto + 1) % this.photos.length;
        this.update();
    }
    
    prev() {
        this.currentPhoto = (this.currentPhoto - 1 + this.photos.length) % this.photos.length;
        this.update();
    }
    
    update() {
        const photo = this.photos[this.currentPhoto];
        document.querySelector('.lightbox-image').src = photo.url;
        document.querySelector('.lightbox-caption').textContent = photo.caption || '';
        document.querySelector('.lightbox-counter').textContent = `${this.currentPhoto + 1} / ${this.photos.length}`;
    }
}

// Initialize photo gallery
const photoGallery = new PhotoGallery();

// Typing indicator for messages
class TypingIndicator {
    constructor() {
        this.init();
    }
    
    init() {
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .typing-dots {
                display: flex;
                gap: 0.3rem;
                padding: 0.8rem 1.2rem;
                background: #e0e0e0;
                border-radius: 18px;
            }
            
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    show(container) {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }
    
    hide(container) {
        const indicator = container.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

const typingIndicator = new TypingIndicator();

// Enhanced search filters
function initializeAdvancedSearch() {
    // Age range slider
    const ageSlider = document.createElement('div');
    ageSlider.innerHTML = `
        <style>
            .range-slider {
                position: relative;
                margin: 2rem 0;
            }
            
            .range-track {
                height: 6px;
                background: #e0e0e0;
                border-radius: 3px;
                position: relative;
            }
            
            .range-fill {
                height: 100%;
                background: var(--primary-color);
                border-radius: 3px;
                position: absolute;
            }
            
            .range-thumb {
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                border: 3px solid white;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .range-values {
                display: flex;
                justify-content: space-between;
                margin-top: 1rem;
                color: #666;
            }
            
            .advanced-filters {
                display: none;
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid #e0e0e0;
            }
            
            .toggle-advanced {
                color: var(--primary-color);
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
                font-weight: 500;
            }
            
            .toggle-advanced i {
                transition: transform 0.3s;
            }
            
            .toggle-advanced.active i {
                transform: rotate(180deg);
            }
        </style>
    `;
    
    // Add to search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'toggle-advanced';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Расширенные фильтры';
        toggleBtn.onclick = function() {
            const filters = document.querySelector('.advanced-filters');
            filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
            this.classList.toggle('active');
        };
        
        const advancedFilters = document.createElement('div');
        advancedFilters.className = 'advanced-filters';
        advancedFilters.innerHTML = `
            <h4>Дополнительные параметры</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Наличие детей</label>
                    <select class="form-input" name="hasChildren">
                        <option value="">Не важно</option>
                        <option value="no">Нет детей</option>
                        <option value="yes">Есть дети</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Готовность к переезду</label>
                    <select class="form-input" name="relocation">
                        <option value="">Не важно</option>
                        <option value="yes">Готов(а) к переезду</option>
                        <option value="no">Не готов(а) к переезду</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Частота посещения храма</label>
                    <select class="form-input" name="churchFrequency">
                        <option value="">Не важно</option>
                        <option value="weekly">Каждую неделю</option>
                        <option value="monthly">Несколько раз в месяц</option>
                        <option value="holidays">По праздникам</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Отношение к венчанию</label>
                    <select class="form-input" name="weddingAttitude">
                        <option value="">Не важно</option>
                        <option value="required">Обязательно венчание</option>
                        <option value="desired">Желательно венчание</option>
                        <option value="discuss">Готов(а) обсудить</option>
                    </select>
                </div>
            </div>
        `;
        
        const form = searchForm.querySelector('form');
        form.appendChild(toggleBtn);
        form.appendChild(advancedFilters);
    }
}

// Profile verification badge
function addVerificationBadge(profileId) {
    const badge = document.createElement('div');
    badge.className = 'verification-badge';
    badge.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Проверенный профиль</span>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .verification-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--info-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Real-time notifications
class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.init();
    }
    
    init() {
        // Create notification center
        const center = document.createElement('div');
        center.className = 'notification-center';
        center.innerHTML = `
            <div class="notification-header">
                <h3>Уведомления</h3>
                <button class="notification-clear" onclick="notificationCenter.clearAll()">
                    Очистить все
                </button>
            </div>
            <div class="notification-list"></div>
        `;
        
        // Add bell icon to header
        const bell = document.createElement('div');
        bell.className = 'notification-bell';
        bell.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge" style="display: none;">0</span>
        `;
        bell.onclick = () => this.toggle();
        
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.appendChild(bell);
        }
        
        document.body.appendChild(center);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-bell {
                position: relative;
                cursor: pointer;
                font-size: 1.3rem;
                color: var(--dark-color);
                margin-left: 1rem;
            }
            
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--danger-color);
                color: white;
                font-size: 0.7rem;
                padding: 0.2rem 0.4rem;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }
            
            .notification-center {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 350px;
                max-height: 500px;
                background: white;
                border-radius: var(--border-radius);
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                display: none;
                z-index: 1000;
                overflow: hidden;
            }
            
            .notification-center.active {
                display: block;
                animation: slideDown 0.3s ease;
            }
            
            .notification-header {
                padding: 1rem;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .notification-clear {
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 0.9rem;
            }
            
            .notification-list {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .notification-item {
                padding: 1rem;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .notification-item:hover {
                background: #f8f8f8;
            }
            
            .notification-item.unread {
                background: #fef5e7;
            }
            
            .notification-time {
                font-size: 0.8rem;
                color: #999;
                margin-top: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    add(message, type = 'info', link = null) {
        const notification = {
            id: Date.now(),
            message,
            type,
            link,
            time: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.update();
        
        // Show toast notification
        showNotification(message, type);
    }
    
    toggle() {
        const center = document.querySelector('.notification-center');
        center.classList.toggle('active');
        
        if (center.classList.contains('active')) {
            this.markAllRead();
        }
    }
    
    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        this.update();
    }
    
    clearAll() {
        this.notifications = [];
        this.update();
    }
    
    update() {
        const list = document.querySelector('.notification-list');
        const badge = document.querySelector('.notification-badge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update badge
        if (unreadCount > 0) {
            badge.style.display = 'block';
            badge.textContent = unreadCount;
        } else {
            badge.style.display = 'none';
        }
        
        // Update list
        if (this.notifications.length === 0) {
            list.innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;">Нет уведомлений</div>';
        } else {
            list.innerHTML = this.notifications.map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}" onclick="notificationCenter.handleClick(${n.id})">
                    <div>${n.message}</div>
                    <div class="notification-time">${this.formatTime(n.time)}</div>
                </div>
            `).join('');
        }
    }
    
    handleClick(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.update();
            
            if (notification.link) {
                window.location.href = notification.link;
            }
        }
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ч. назад`;
        
        const days = Math.floor(hours / 24);
        return `${days} дн. назад`;
    }
}

// Initialize notification center
const notificationCenter = new NotificationCenter();

// Smooth scroll with offset for sticky header
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Lazy loading for images
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
        img[data-src] {
            filter: blur(5px);
            transition: filter 0.3s;
        }
        
        img[data-src].loaded {
            filter: blur(0);
        }
    `;
    document.head.appendChild(style);
}

// Form validation with real-time feedback
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            // Create error message element
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            input.parentNode.appendChild(errorMsg);
            
            // Real-time validation
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
    });
    
    // Add validation styles
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: var(--danger-color);
            font-size: 0.85rem;
            margin-top: 0.25rem;
            display: block;
            min-height: 1.2rem;
        }
        
        .form-input.success {
            border-color: var(--success-color);
        }
        
        .form-input.success:focus {
            box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
        }
    `;
    document.head.appendChild(style);
}

function validateField(field) {
    const errorMsg = field.parentNode.querySelector('.error-message');
    let isValid = true;
    let message = '';
    
    // Check if empty
    if (!field.value.trim()) {
        isValid = false;
        message = 'Это поле обязательно для заполнения';
    } else {
        // Specific validation
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    message = 'Введите корректный email';
                }
                break;
                
            case 'number':
                if (field.name === 'age') {
                    const age = parseInt(field.value);
                    if (age < 18 || age > 80) {
                        isValid = false;
                        message = 'Возраст должен быть от 18 до 80 лет';
                    }
                }
                break;
                
            case 'password':
                if (field.value.length < 8) {
                    isValid = false;
                    message = 'Пароль должен содержать минимум 8 символов';
                }
                break;
        }
    }
    
    // Update UI
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        errorMsg.textContent = '';
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        errorMsg.textContent = message;
    }
    
    return isValid;
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedSearch();
    initializeLazyLoading();
    enhanceFormValidation();
    
    // Simulate some notifications
    setTimeout(() => {
        if (currentUser) {
            notificationCenter.add('Мария просмотрела вашу анкету', 'info');
            notificationCenter.add('У вас новое сообщение от Александра', 'info', '#messages');
            notificationCenter.add('Ваша анкета одобрена модератором', 'success');
        }
    }, 5000);
});