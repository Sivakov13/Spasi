/**
 * Optimized Orthodox Dating App
 * Performance-focused implementation with lazy loading and efficient DOM management
 */

// Performance utilities
const Performance = {
    // Debounce function to limit expensive operations
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Measure and log performance
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
        }
    },

    measure(name, startMark, endMark) {
        if (performance.measure) {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        }
    }
};

// Lazy loading utility
const LazyLoader = {
    // Intersection Observer for lazy loading
    observer: null,

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    },

    observe(element) {
        if (this.observer) {
            this.observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadElement(element);
        }
    },

    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        
        if (element.classList.contains('lazy-section')) {
            element.classList.add('loaded');
        }
    }
};

// Virtual DOM utility for efficient updates
const VirtualDOM = {
    // Cache for rendered elements
    cache: new Map(),

    // Create element from template
    createElement(tag, props = {}, ...children) {
        const element = document.createElement(tag);
        
        // Set properties
        Object.keys(props).forEach(key => {
            if (key === 'className') {
                element.className = props[key];
            } else if (key === 'onClick') {
                element.addEventListener('click', props[key]);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, props[key]);
            } else {
                element[key] = props[key];
            }
        });

        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Batch DOM updates
    batchUpdate(updates) {
        const fragment = document.createDocumentFragment();
        updates.forEach(update => {
            if (typeof update === 'function') {
                update();
            } else if (update instanceof Node) {
                fragment.appendChild(update);
            }
        });
        return fragment;
    }
};

// Main Application
const App = {
    // Application state
    state: {
        currentUser: null,
        currentSection: 'home',
        profiles: [],
        favorites: [],
        loading: false,
        cache: new Map()
    },

    // Initialize application
    async init() {
        Performance.mark('app-init-start');
        
        // Initialize lazy loading
        LazyLoader.init();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load lazy sections
        this.loadLazySections();
        
        Performance.mark('app-init-end');
        Performance.measure('app-init', 'app-init-start', 'app-init-end');
    },

    // Load initial data asynchronously
    async loadInitialData() {
        try {
            // Load stats with delay to simulate API call
            setTimeout(() => this.loadStats(), 100);
            
            // Load profiles data
            this.state.profiles = await this.fetchProfiles();
            
            // Load quick actions
            setTimeout(() => this.loadQuickActions(), 200);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Ошибка загрузки данных', 'error');
        }
    },

    // Fetch profiles with caching
    async fetchProfiles() {
        const cacheKey = 'profiles';
        
        // Check cache first
        if (this.state.cache.has(cacheKey)) {
            return this.state.cache.get(cacheKey);
        }

        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const profiles = [
                    {
                        id: 1,
                        name: 'Мария',
                        age: 28,
                        city: 'Москва',
                        avatar: 'М',
                        gender: 'female',
                        churchStatus: 'воцерковленная',
                        maritalStatus: 'не замужем',
                        online: true,
                        quote: 'Ищу верующего человека для создания крепкой православной семьи...',
                        about: 'Преподаю в воскресной школе, люблю паломничества по святым местам.',
                        interests: ['паломничество', 'церковное пение', 'чтение'],
                        education: 'высшее',
                        profession: 'Преподаватель'
                    },
                    {
                        id: 2,
                        name: 'Александр',
                        age: 32,
                        city: 'Санкт-Петербург',
                        avatar: 'А',
                        gender: 'male',
                        churchStatus: 'воцерковленный',
                        maritalStatus: 'холост',
                        online: true,
                        quote: 'Воцерковленный христианин, ищу спутницу жизни для совместного пути к Богу...',
                        about: 'Служу в алтаре, участвую в приходской жизни. Ищу верующую девушку для создания семьи.',
                        interests: ['богословие', 'благотворительность', 'чтение'],
                        education: 'высшее',
                        profession: 'Инженер'
                    },
                    {
                        id: 3,
                        name: 'Елена',
                        age: 26,
                        city: 'Екатеринбург',
                        avatar: 'Е',
                        gender: 'female',
                        churchStatus: 'неофит',
                        maritalStatus: 'не замужем',
                        online: false,
                        quote: 'Недавно пришла к вере, ищу человека, который поможет расти духовно...',
                        about: 'Два года назад крестилась, активно изучаю Православие. Ищу понимающего и терпеливого человека.',
                        interests: ['богословие', 'природа', 'чтение'],
                        education: 'среднее специальное',
                        profession: 'Медсестра'
                    }
                ];
                
                // Cache the result
                this.state.cache.set(cacheKey, profiles);
                resolve(profiles);
            }, 300);
        });
    },

    // Load stats asynchronously
    loadStats() {
        const statsElement = document.getElementById('stats');
        if (!statsElement) return;

        const statsHTML = `
            <div class="stat-card">
                <div class="stat-number">1,234</div>
                <div>Активных анкет</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">156</div>
                <div>Счастливых пар</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">89</div>
                <div>Венчаний</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">24/7</div>
                <div>Поддержка</div>
            </div>
        `;

        // Use requestAnimationFrame for smooth update
        requestAnimationFrame(() => {
            statsElement.innerHTML = statsHTML;
        });
    },

    // Load quick actions asynchronously
    loadQuickActions() {
        const quickActionsElement = document.getElementById('quickActions');
        if (!quickActionsElement) return;

        const quickActionsHTML = `
            <div class="container">
                <h2 class="section-title">Как это работает?</h2>
                <div class="actions-grid">
                    <div class="action-card" onclick="App.showModal('registerModal')">
                        <div class="action-icon">👤</div>
                        <h3>Регистрация</h3>
                        <p>Создайте аккаунт и заполните анкету</p>
                    </div>
                    <div class="action-card" onclick="App.showSection('search')">
                        <div class="action-icon">🔍</div>
                        <h3>Поиск</h3>
                        <p>Найдите подходящего человека</p>
                    </div>
                    <div class="action-card" onclick="App.showSection('profiles')">
                        <div class="action-icon">💬</div>
                        <h3>Общение</h3>
                        <p>Начните общаться и узнавать друг друга</p>
                    </div>
                    <div class="action-card" onclick="App.showSection('about')">
                        <div class="action-icon">❤️</div>
                        <h3>Встреча</h3>
                        <p>Встретьтесь и создайте семью</p>
                    </div>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            quickActionsElement.innerHTML = quickActionsHTML;
            quickActionsElement.classList.add('loaded');
        });
    },

    // Setup event listeners with delegation
    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Throttled scroll listener
        window.addEventListener('scroll', Performance.throttle(() => {
            this.handleScroll();
        }, 100));

        // Debounced resize listener
        window.addEventListener('resize', Performance.debounce(() => {
            this.handleResize();
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    },

    // Centralized click handler
    handleClick(event) {
        const target = event.target;
        
        // Handle modal close
        if (target.classList.contains('modal')) {
            this.closeModal(target.id);
        }
        
        // Handle outside user menu clicks
        if (!target.closest('#userAvatar') && !target.closest('#userMenu')) {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        }
    },

    // Handle scroll events
    handleScroll() {
        // Add scroll-based optimizations here
        // For example, hide/show elements based on scroll position
    },

    // Handle resize events
    handleResize() {
        // Add resize-based optimizations here
        // For example, recalculate grid layouts
    },

    // Handle keyboard events
    handleKeydown(event) {
        // ESC to close modals
        if (event.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Enter to send message in message input
        if (event.key === 'Enter' && event.target.id === 'messageInput') {
            this.sendMessage();
        }
    },

    // Load sections lazily
    loadLazySections() {
        const lazySections = document.querySelectorAll('.lazy-section');
        lazySections.forEach(section => {
            LazyLoader.observe(section);
        });
    },

    // Show section with lazy loading
    async showSection(sectionId) {
        Performance.mark('section-change-start');
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        let section = document.getElementById(sectionId);
        
        // Lazy load section if it doesn't exist
        if (!section && sectionId !== 'home') {
            section = await this.loadSection(sectionId);
        }
        
        if (section) {
            section.classList.add('active');
            this.state.currentSection = sectionId;
            
            // Update navigation
            this.updateNavigation(sectionId);
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
        
        Performance.mark('section-change-end');
        Performance.measure('section-change', 'section-change-start', 'section-change-end');
    },

    // Lazy load section
    async loadSection(sectionId) {
        const sectionsContainer = document.getElementById('sectionsContainer');
        if (!sectionsContainer) return null;

        let sectionHTML = '';
        
        switch (sectionId) {
            case 'profiles':
                sectionHTML = await this.createProfilesSection();
                break;
            case 'search':
                sectionHTML = await this.createSearchSection();
                break;
            case 'create':
                sectionHTML = await this.createCreateSection();
                break;
            case 'cabinet':
                sectionHTML = await this.createCabinetSection();
                break;
            case 'messages':
                sectionHTML = await this.createMessagesSection();
                break;
            case 'favorites':
                sectionHTML = await this.createFavoritesSection();
                break;
            case 'about':
                sectionHTML = await this.createAboutSection();
                break;
            default:
                return null;
        }

        // Create section element
        const section = document.createElement('section');
        section.id = sectionId;
        section.className = 'section';
        section.innerHTML = sectionHTML;
        
        sectionsContainer.appendChild(section);
        return section;
    },

    // Create profiles section
    async createProfilesSection() {
        const profiles = this.state.profiles;
        const profileCards = profiles.map(profile => this.createProfileCard(profile)).join('');
        
        return `
            <div class="container">
                <h2 class="section-title">Рекомендуемые анкеты</h2>
                <div class="profiles-grid" id="profilesGrid">
                    ${profileCards}
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="App.loadMoreProfiles()">
                        <span>+</span> Загрузить ещё
                    </button>
                </div>
            </div>
        `;
    },

    // Create search section
    async createSearchSection() {
        return `
            <div class="container">
                <h2 class="section-title">Поиск анкет</h2>
                <div class="search-form">
                    <form id="searchForm" onsubmit="App.performSearch(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Я ищу</label>
                                <select class="form-input" name="gender">
                                    <option value="">Любой пол</option>
                                    <option value="male">Мужчину</option>
                                    <option value="female">Женщину</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Возраст от</label>
                                <input type="number" class="form-input" name="ageFrom" min="18" placeholder="18">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Возраст до</label>
                                <input type="number" class="form-input" name="ageTo" max="80" placeholder="50">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Город</label>
                                <input type="text" class="form-input" name="city" placeholder="Любой город">
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary btn-large">
                                🔍 Найти
                            </button>
                        </div>
                    </form>
                </div>
                <div id="searchResults" style="display: none;">
                    <h3 style="margin-top: 2rem;">Результаты поиска</h3>
                    <div class="profiles-grid" id="searchResultsGrid"></div>
                </div>
            </div>
        `;
    },

    // Create profile card efficiently
    createProfileCard(profile) {
        const interestTags = profile.interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        return `
            <div class="profile-card" onclick="App.showProfile(${profile.id})">
                <div class="profile-header">
                    <div class="profile-avatar">${profile.avatar}</div>
                    <div>
                        <div class="profile-name">
                            ${profile.name}, <span class="profile-age">${profile.age} лет</span>
                            ${profile.online ? '<span class="online-indicator"></span>' : ''}
                        </div>
                        <div class="profile-location">📍 ${profile.city}</div>
                    </div>
                </div>
                <div class="profile-quote">"${profile.quote}"</div>
                <div class="profile-interests">${interestTags}</div>
                <div class="profile-actions">
                    <button class="btn btn-primary btn-small" onclick="App.handleMessage(event, ${profile.id})">
                        ✉️ Написать
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="App.handleFavorite(event, ${profile.id})">
                        ❤️ В избранное
                    </button>
                </div>
            </div>
        `;
    },

    // Update navigation
    updateNavigation(sectionId) {
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
    },

    // Load section-specific data
    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'profiles':
                // Load profiles if not already loaded
                if (this.state.profiles.length === 0) {
                    this.fetchProfiles().then(profiles => {
                        this.state.profiles = profiles;
                        this.renderProfiles();
                    });
                }
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            // Add other section-specific loading logic here
        }
    },

    // Re-render profiles grid if it exists
    renderProfiles() {
        const profilesGrid = document.getElementById('profilesGrid');
        if (!profilesGrid) return;
        profilesGrid.innerHTML = this.state.profiles.map(profile => this.createProfileCard(profile)).join('');
    },

    // Render favorites section content
    renderFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        if (!favoritesGrid) return;

        const favoriteProfiles = this.state.profiles.filter(p => this.state.favorites.includes(p.id));
        if (favoriteProfiles.length === 0) {
            favoritesGrid.innerHTML = `
                <div style="text-align:center; padding: 2rem; color: #666;">
                    <p style="margin: 0 0 1rem;">У вас пока нет избранных анкет.</p>
                    <button class="btn btn-primary" onclick="App.showSection('profiles')">Перейти к анкетам</button>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = favoriteProfiles.map(profile => this.createProfileCard(profile)).join('');
    },

    // Show profile modal
    showProfile(profileId) {
        const profile = this.state.profiles.find(p => p.id === profileId);
        if (!profile) return;

        // Store current profile ID
        this.currentProfileId = profileId;

        // Create modal if it doesn't exist
        let modal = document.getElementById('profileModal');
        if (!modal) {
            modal = this.createProfileModal();
            document.getElementById('modalsContainer').appendChild(modal);
        }

        // Update modal content
        this.updateProfileModal(profile);
        this.showModal('profileModal');
    },

    // Create profile modal
    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="profileModalName">Имя профиля</h2>
                    <button class="modal-close" onclick="App.closeModal('profileModal')">&times;</button>
                </div>
                <div id="profileModalContent"></div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="App.sendMessageToProfile()">
                        ✉️ Написать
                    </button>
                    <button class="btn btn-secondary" onclick="App.addProfileToFavorites()">
                        ❤️ В избранное
                    </button>
                </div>
            </div>
        `;
        return modal;
    },

    // Update profile modal content
    updateProfileModal(profile) {
        document.getElementById('profileModalName').textContent = `${profile.name}, ${profile.age} лет`;
        document.getElementById('profileModalContent').innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div class="profile-avatar" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto;">
                    ${profile.avatar}
                </div>
                ${profile.online ? '<p style="color: #4caf50;">🟢 Сейчас онлайн</p>' : '<p style="color: #666;">Был(а) в сети недавно</p>'}
            </div>
            <div class="form-group"><strong>Город:</strong> ${profile.city}</div>
            <div class="form-group"><strong>Воцерковленность:</strong> ${profile.churchStatus}</div>
            <div class="form-group"><strong>Семейное положение:</strong> ${profile.maritalStatus}</div>
            <div class="form-group"><strong>Образование:</strong> ${profile.education}</div>
            <div class="form-group"><strong>Профессия:</strong> ${profile.profession}</div>
            <div class="form-group">
                <strong>О себе:</strong>
                <p>${profile.about}</p>
            </div>
            <div class="form-group">
                <strong>Интересы:</strong>
                <div class="profile-interests" style="margin-top: 0.5rem;">
                    ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                </div>
            </div>
        `;
    },

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    },

    // Show notification with auto-hide
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    },

    // Handle message button
    handleMessage(event, profileId) {
        event.stopPropagation();
        if (!this.state.currentUser) {
            this.showNotification('Для отправки сообщений необходимо войти', 'warning');
            this.showModal('loginModal');
            return;
        }
        
        this.showSection('messages');
        this.showNotification('Открыт чат', 'info');
    },

    // Handle favorite button
    handleFavorite(event, profileId) {
        event.stopPropagation();
        if (!this.state.currentUser) {
            this.showNotification('Для добавления в избранное необходимо войти', 'warning');
            this.showModal('loginModal');
            return;
        }
        
        if (this.state.favorites.includes(profileId)) {
            this.state.favorites = this.state.favorites.filter(id => id !== profileId);
            this.showNotification('Удалено из избранного');
        } else {
            this.state.favorites.push(profileId);
            this.showNotification('Добавлено в избранное');
        }

        // If favorites section is present, keep it in sync
        this.renderFavorites();
    },

    // Handle create profile
    handleCreateProfile() {
        if (!this.state.currentUser) {
            this.showNotification('Для создания анкеты необходимо войти', 'warning');
            this.showModal('loginModal');
            return;
        }
        
        this.showSection('create');
    },

    // Toggle user menu
    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.classList.toggle('active');
        }
    },

    // Send message from the messages section
    sendMessage() {
        const input = document.getElementById('messageInput');
        const messagesContainer = document.getElementById('chatMessages');
        if (!input || !messagesContainer) return;

        const text = (input.value || '').trim();
        if (!text) return;

        const msg = document.createElement('div');
        msg.className = 'message sent';
        msg.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(msg);
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate a response
        setTimeout(() => {
            const responseTexts = [
                'Спасибо за сообщение! Очень приятно познакомиться.',
                'Расскажите, пожалуйста, немного о себе.',
                'Как давно вы воцерковлены?'
            ];
            const response = responseTexts[Math.floor(Math.random() * responseTexts.length)];
            const resp = document.createElement('div');
            resp.className = 'message received';
            resp.innerHTML = `<div class="message-content">${escapeHtml(response)}</div>`;
            messagesContainer.appendChild(resp);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 900);
    },

    // Perform search with debouncing
    performSearch: Performance.debounce(function(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const searchParams = Object.fromEntries(formData);
        
        // Filter profiles based on search params
        let results = this.state.profiles.filter(profile => {
            if (searchParams.gender && profile.gender !== searchParams.gender) return false;
            if (searchParams.ageFrom && profile.age < parseInt(searchParams.ageFrom)) return false;
            if (searchParams.ageTo && profile.age > parseInt(searchParams.ageTo)) return false;
            if (searchParams.city && !profile.city.toLowerCase().includes(searchParams.city.toLowerCase())) return false;
            return true;
        });
        
        // Display results
        const resultsGrid = document.getElementById('searchResultsGrid');
        if (resultsGrid) {
            if (results.length === 0) {
                resultsGrid.innerHTML = '<p style="text-align: center; color: #666;">Не найдено анкет по вашим критериям</p>';
            } else {
                resultsGrid.innerHTML = results.map(profile => this.createProfileCard(profile)).join('');
            }
            
            document.getElementById('searchResults').style.display = 'block';
            this.showNotification(`Найдено анкет: ${results.length}`);
        }
    }, 300),

    // Load more profiles with pagination
    async loadMoreProfiles() {
        this.showNotification('Загружаем больше анкет...', 'info');
        
        // Simulate API call
        const newProfiles = await new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: this.state.profiles.length + 1,
                        name: 'Ольга',
                        age: 29,
                        city: 'Ростов-на-Дону',
                        avatar: 'О',
                        gender: 'female',
                        churchStatus: 'воцерковленная',
                        maritalStatus: 'не замужем',
                        online: false,
                        quote: 'Ищу православного мужчину для создания семьи в вере...',
                        about: 'Работаю в православной гимназии, веду благотворительные проекты.',
                        interests: ['благотворительность', 'чтение', 'природа'],
                        education: 'высшее',
                        profession: 'Педагог'
                    }
                ]);
            }, 1000);
        });
        
        this.state.profiles.push(...newProfiles);
        this.renderNewProfiles(newProfiles);
        this.showNotification('Загружены новые анкеты');
    },

    // Render new profiles efficiently
    renderNewProfiles(newProfiles) {
        const profilesGrid = document.getElementById('profilesGrid');
        if (!profilesGrid) return;

        const fragment = document.createDocumentFragment();
        newProfiles.forEach(profile => {
            const profileElement = document.createElement('div');
            profileElement.innerHTML = this.createProfileCard(profile);
            fragment.appendChild(profileElement.firstElementChild);
        });
        
        profilesGrid.appendChild(fragment);
    },

    // Login functionality
    login(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation
        if (email && password) {
            this.state.currentUser = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                avatar: email[0].toUpperCase()
            };
            
            this.updateAuthUI();
            this.closeModal('loginModal');
            this.showNotification('Вход выполнен успешно!');
            this.showSection('cabinet');
        }
    },

    // Register functionality
    register(event) {
        event.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (name && email && password) {
            this.state.currentUser = {
                id: Date.now(),
                name: name,
                email: email,
                avatar: name[0].toUpperCase()
            };
            
            this.updateAuthUI();
            this.closeModal('registerModal');
            this.showNotification('Регистрация успешна! Теперь создайте анкету.');
            this.showSection('create');
        }
    },

    // Update auth UI
    updateAuthUI() {
        if (this.state.currentUser) {
            document.getElementById('authButtons').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('userName').textContent = this.state.currentUser.name;
            document.getElementById('userAvatar').textContent = this.state.currentUser.avatar;
        } else {
            document.getElementById('authButtons').style.display = 'flex';
            document.getElementById('userInfo').style.display = 'none';
        }
    },

    // Logout functionality
    logout() {
        this.state.currentUser = null;
        this.state.favorites = [];
        this.updateAuthUI();
        this.showNotification('Вы вышли из системы');
        this.showSection('home');
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.remove('active');
    },

    // Send message to profile
    sendMessageToProfile() {
        if (!this.state.currentUser) {
            this.closeModal('profileModal');
            this.showModal('loginModal');
            return;
        }
        
        this.closeModal('profileModal');
        this.showSection('messages');
        this.showNotification('Открыт чат с пользователем');
    },

    // Add profile to favorites
    addProfileToFavorites() {
        if (!this.state.currentUser) {
            this.closeModal('profileModal');
            this.showModal('loginModal');
            return;
        }
        
        if (this.currentProfileId && !this.state.favorites.includes(this.currentProfileId)) {
            this.state.favorites.push(this.currentProfileId);
            this.showNotification('Добавлено в избранное');
        }
    },

    // Create about section
    async createAboutSection() {
        return `
            <div class="container">
                <h2 class="section-title">О платформе</h2>
                
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                        "Спаси и Сохрани" — это православная платформа знакомств для верующих людей, 
                        которые ищут спутника жизни для создания крепкой семьи, основанной на общих духовных ценностях.
                    </p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 3rem;">
                        <div>
                            <div style="font-size: 3rem; color: #e91e63; margin-bottom: 1rem;">❤️</div>
                            <h3>Серьезные отношения</h3>
                            <p>Только для тех, кто ищет спутника жизни для создания семьи</p>
                        </div>
                        <div>
                            <div style="font-size: 3rem; color: #e91e63; margin-bottom: 1rem;">✝️</div>
                            <h3>Православные ценности</h3>
                            <p>Объединяем людей с общими духовными ценностями</p>
                        </div>
                        <div>
                            <div style="font-size: 3rem; color: #e91e63; margin-bottom: 1rem;">🛡️</div>
                            <h3>Безопасность</h3>
                            <p>Проверка анкет и защита личных данных</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 3rem;">
                        <h3>Контакты</h3>
                        <p>Email: info@spasi-sohrani.ru</p>
                        <p>Телефон: +7 (495) 123-45-67</p>
                        <p>Адрес: Москва, ул. Православная, д. 1</p>
                    </div>
                </div>
            </div>
        `;
    },

    // Create create section
    async createCreateSection() {
        return `
            <div class="container">
                <h2 class="section-title">Создать анкету</h2>
                <div class="create-form">
                    <p style="text-align: center; padding: 2rem; color: #666;">
                        Функция создания анкеты будет доступна в полной версии приложения.
                        <br><br>
                        <button class="btn btn-secondary" onclick="App.showSection('home')">
                            ← Вернуться на главную
                        </button>
                    </p>
                </div>
            </div>
        `;
    },

    // Create cabinet section
    async createCabinetSection() {
        const userName = this.state.currentUser?.name || 'Пользователь';
        return `
            <div class="container">
                <h2 class="section-title">Кабинет</h2>
                <div class="create-form">
                    <p style="margin-top: 0; color: #666; text-align: center;">
                        Добро пожаловать, <strong>${escapeHtml(userName)}</strong>.
                    </p>
                    <div style="display:flex; gap: 1rem; justify-content:center; flex-wrap:wrap; margin-top: 1.5rem;">
                        <button class="btn btn-primary" onclick="App.showSection('profiles')">Смотреть анкеты</button>
                        <button class="btn btn-secondary" onclick="App.showSection('favorites')">Избранное</button>
                        <button class="btn btn-secondary" onclick="App.showSection('messages')">Сообщения</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Create messages section
    async createMessagesSection() {
        return `
            <div class="container">
                <h2 class="section-title">Сообщения</h2>
                <div class="messages-container">
                    <div class="chats-list">
                        <div class="chat-item active">Мария</div>
                        <div class="chat-item">Александр</div>
                    </div>
                    <div class="chat-window">
                        <div class="messages-area" id="chatMessages">
                            <div class="message received"><div class="message-content">Здравствуйте! Рада знакомству.</div></div>
                        </div>
                        <div class="message-input">
                            <input id="messageInput" class="form-input" type="text" placeholder="Введите сообщение..." autocomplete="off" />
                            <button class="btn btn-primary btn-small" onclick="App.sendMessage()">Отправить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Create favorites section
    async createFavoritesSection() {
        return `
            <div class="container">
                <h2 class="section-title">Избранное</h2>
                <div class="favorites-grid" id="favoritesGrid"></div>
            </div>
        `;
    }
};

// Small helper to avoid injecting raw HTML from user input
function escapeHtml(unsafe) {
    return String(unsafe)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for global access
window.App = App;