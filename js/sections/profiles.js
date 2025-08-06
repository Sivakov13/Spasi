// Profiles section module

import { profilesData } from '../data/profiles.js';
import { imageLoader } from '../utils/imageLoader.js';

export default {
    async render() {
        const section = document.createElement('section');
        section.id = 'profiles';
        section.className = 'section';
        
        section.innerHTML = `
            <div class="container">
                <h2 class="section-title">Рекомендуемые анкеты</h2>
                
                <div class="profiles-grid" id="profilesGrid">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="window.profilesSection.loadMore()">
                        <i class="fas fa-plus"></i> Загрузить ещё
                    </button>
                </div>
            </div>
        `;
        
        return section;
    },

    async init() {
        // Load profiles
        const profiles = await profilesData.load();
        this.displayProfiles(profiles.slice(0, 6));
        
        // Set up lazy loading for images
        this.setupLazyLoading();
    },

    displayProfiles(profiles) {
        const grid = document.getElementById('profilesGrid');
        grid.innerHTML = profiles.map(profile => this.createProfileCard(profile)).join('');
    },

    createProfileCard(profile) {
        const interestTags = profile.interests.slice(0, 3).map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        return `
            <div class="profile-card will-change-transform" onclick="window.profilesSection.showProfile(${profile.id})">
                <div class="profile-header">
                    <div class="profile-avatar">${profile.avatar}</div>
                    <div>
                        <div class="profile-name">
                            ${profile.name}, <span class="profile-age">${profile.age} лет</span>
                            ${profile.online ? '<span class="online-indicator"></span>' : ''}
                        </div>
                        <div class="profile-location"><i class="fas fa-map-marker-alt"></i> ${profile.city}</div>
                    </div>
                </div>
                <div class="profile-quote">"${profile.quote}"</div>
                <div class="profile-interests">${interestTags}</div>
                <div class="profile-actions">
                    <button class="btn btn-primary btn-small" onclick="window.profilesSection.handleMessage(event, ${profile.id})">
                        <i class="fas fa-envelope"></i> Написать
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="window.profilesSection.handleFavorite(event, ${profile.id})">
                        <i class="fas fa-heart"></i> В избранное
                    </button>
                </div>
            </div>
        `;
    },

    setupLazyLoading() {
        // Images will be lazy loaded when they come into view
        const images = document.querySelectorAll('.profile-card img[data-src]');
        images.forEach(img => {
            window.app.imageObserver.observe(img);
        });
    },

    async showProfile(profileId) {
        const profile = profilesData.getById(profileId);
        if (!profile) return;
        
        window.app.state.currentProfileId = profileId;
        
        // Update profile view
        profilesData.addView(profileId, window.app.state.currentUser?.id);
        
        // Show profile modal
        if (!document.getElementById('profileModal')) {
            const modalModule = await import('../modals.js');
            modalModule.loadModal('profileModal');
        }
        
        // Update modal content
        document.getElementById('profileModalName').textContent = `${profile.name}, ${profile.age} лет`;
        document.getElementById('profileModalContent').innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div class="profile-avatar" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto;">
                    ${profile.avatar}
                </div>
                ${profile.online ? '<p style="color: #4caf50;"><i class="fas fa-circle"></i> Сейчас онлайн</p>' : '<p style="color: #666;">Был(а) в сети недавно</p>'}
            </div>
            
            <div class="form-group">
                <strong>Город:</strong> ${profile.city}
            </div>
            
            <div class="form-group">
                <strong>Воцерковленность:</strong> ${profile.churchStatus}
            </div>
            
            <div class="form-group">
                <strong>Семейное положение:</strong> ${profile.maritalStatus}
            </div>
            
            <div class="form-group">
                <strong>Образование:</strong> ${profile.education}
            </div>
            
            <div class="form-group">
                <strong>Профессия:</strong> ${profile.profession}
            </div>
            
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
        
        window.showModal('profileModal');
    },

    handleMessage(event, profileId) {
        event.stopPropagation();
        
        if (!window.app.state.currentUser) {
            window.showNotification('Для отправки сообщений необходимо войти', 'warning');
            window.showModal('loginModal');
            return;
        }
        
        window.showSection('messages');
        window.showNotification('Открыт чат с пользователем');
    },

    handleFavorite(event, profileId) {
        event.stopPropagation();
        
        if (!window.app.state.currentUser) {
            window.showNotification('Для добавления в избранное необходимо войти', 'warning');
            window.showModal('loginModal');
            return;
        }
        
        const favorites = window.app.state.favorites;
        
        if (favorites.includes(profileId)) {
            window.app.state.favorites = favorites.filter(id => id !== profileId);
            window.showNotification('Удалено из избранного');
        } else {
            window.app.state.favorites.push(profileId);
            window.showNotification('Добавлено в избранное');
        }
        
        // Update UI
        event.target.classList.toggle('active');
    },

    async loadMore() {
        window.showNotification('Загружаем больше анкет...', 'info');
        
        // Simulate loading more profiles
        setTimeout(() => {
            const currentCount = document.querySelectorAll('.profile-card').length;
            const allProfiles = profilesData.profiles;
            const nextProfiles = allProfiles.slice(currentCount, currentCount + 3);
            
            if (nextProfiles.length > 0) {
                const grid = document.getElementById('profilesGrid');
                grid.innerHTML += nextProfiles.map(profile => this.createProfileCard(profile)).join('');
                this.setupLazyLoading();
                window.showNotification('Загружены новые анкеты');
            } else {
                window.showNotification('Больше анкет нет', 'info');
            }
        }, 500);
    }
};

// Export to window for event handlers
window.profilesSection = {
    showProfile: function(id) { return window.appState.sections.profiles.showProfile(id); },
    handleMessage: function(e, id) { return window.appState.sections.profiles.handleMessage(e, id); },
    handleFavorite: function(e, id) { return window.appState.sections.profiles.handleFavorite(e, id); },
    loadMore: function() { return window.appState.sections.profiles.loadMore(); }
};