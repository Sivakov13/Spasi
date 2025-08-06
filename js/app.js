// Main App Module
import { profilesData } from './data/profiles.js';
import { imageLoader } from './utils/imageLoader.js';
import { debounce, throttle } from './utils/performance.js';

// App initialization
class App {
    constructor() {
        this.state = window.appState || {
            currentUser: null,
            sections: {},
            profiles: [],
            favorites: [],
            currentStep: 1,
            uploadedPhotos: [],
            currentProfileId: null,
            currentPhotoSlot: null
        };
        
        this.init();
    }

    async init() {
        // Initialize profiles data
        this.state.profiles = await profilesData.load();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize intersection observer for lazy loading
        this.setupIntersectionObserver();
        
        // Check for saved user session
        this.checkUserSession();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Click outside handlers
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userAvatar') && !e.target.closest('#userMenu')) {
                document.getElementById('userMenu').classList.remove('active');
            }
        });
        
        // Window resize handler with debouncing
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
        
        // Scroll handler with throttling
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 100));
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    imageLoader.load(img);
                    this.imageObserver.unobserve(img);
                }
            });
        }, options);

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    handleKeyboardShortcuts(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            window.showSection('search');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    handleResize() {
        // Update UI based on viewport size
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    checkUserSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.state.currentUser = JSON.parse(savedUser);
                this.updateAuthUI();
            } catch (e) {
                console.error('Failed to restore user session');
            }
        }
    }

    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.state.currentUser) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = this.state.currentUser.name;
            userAvatar.textContent = this.state.currentUser.avatar;
            
            // Update message counts
            this.updateMessageCounts();
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    updateMessageCounts() {
        // Simulate message count
        const count = Math.floor(Math.random() * 10);
        document.querySelectorAll('#messagesCount, #cabinetMessagesCount').forEach(el => {
            el.textContent = count;
        });
    }

    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Monitor First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        }
    }

    // Public methods for global access
    login(email, password) {
        // Implement login logic
        if (email && password) {
            this.state.currentUser = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                avatar: email[0].toUpperCase()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
            this.updateAuthUI();
            return true;
        }
        return false;
    }

    logout() {
        this.state.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        window.showNotification('Вы вышли из системы');
        window.showSection('home');
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Initialize app
const app = new App();

// Export global functions
window.app = app;
window.showNotification = app.showNotification.bind(app);
window.logout = app.logout.bind(app);

export default app;