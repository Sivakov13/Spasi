// Global variables
let currentUser = null;
let currentStep = 1;
let uploadedPhotos = [];
let profiles = [];
let favorites = [];
let currentProfileId = null;
let currentPhotoSlot = null;
let visitors = [];
let messageNotifications = 0;

// Initialize profiles data with more realistic data
function initializeProfiles() {
    profiles = [
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
            lastSeen: new Date(),
            quote: 'Ищу верующего человека для создания крепкой православной семьи...',
            about: 'Преподаю в воскресной школе, люблю паломничества по святым местам. Регулярно посещаю храм, участвую в церковной жизни. Мечтаю о большой дружной семье.',
            interests: ['паломничество', 'церковное пение', 'чтение'],
            education: 'высшее',
            profession: 'Преподаватель',
            photos: ['photo1.jpg', 'photo2.jpg'],
            verified: true
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
            lastSeen: new Date(),
            quote: 'Воцерковленный христианин, ищу спутницу жизни для совместного пути к Богу...',
            about: 'Служу в алтаре, участвую в приходской жизни. Ищу верующую девушку для создания семьи. Готов к серьезным отношениям.',
            interests: ['богословие', 'благотворительность', 'чтение'],
            education: 'высшее',
            profession: 'Инженер',
            photos: ['photo3.jpg'],
            verified: true
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
            lastSeen: new Date(Date.now() - 3600000),
            quote: 'Недавно пришла к вере, ищу человека, который поможет расти духовно...',
            about: 'Два года назад крестилась, активно изучаю Православие. Ищу понимающего и терпеливого человека.',
            interests: ['богословие', 'природа', 'чтение'],
            education: 'среднее специальное',
            profession: 'Медсестра',
            photos: ['photo4.jpg', 'photo5.jpg', 'photo6.jpg'],
            verified: false
        },
        {
            id: 4,
            name: 'Дмитрий',
            age: 35,
            city: 'Новосибирск',
            avatar: 'Д',
            gender: 'male',
            churchStatus: 'воцерковленный',
            maritalStatus: 'разведен',
            online: false,
            lastSeen: new Date(Date.now() - 7200000),
            quote: 'После развода нашел утешение в вере. Ищу верующую спутницу для новой семьи...',
            about: 'Имею церковный развод. Воспитываю сына. Регулярно посещаю храм, участвую в паломничествах.',
            interests: ['паломничество', 'спорт', 'путешествия'],
            education: 'высшее',
            profession: 'Врач',
            photos: ['photo7.jpg'],
            verified: true
        },
        {
            id: 5,
            name: 'Анна',
            age: 30,
            city: 'Краснодар',
            avatar: 'А',
            gender: 'female',
            churchStatus: 'воцерковленная',
            maritalStatus: 'не замужем',
            online: true,
            lastSeen: new Date(),
            quote: 'Ищу серьезного православного мужчину для создания большой семьи...',
            about: 'Пою на клиросе, веду занятия в воскресной школе. Мечтаю о большой православной семье.',
            interests: ['церковное пение', 'благотворительность', 'чтение'],
            education: 'высшее',
            profession: 'Учитель',
            photos: ['photo8.jpg', 'photo9.jpg'],
            verified: true
        }
    ];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeProfiles();
    loadProfiles();
    animateStats();
    
    // Add click outside handler for user menu
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#userAvatar') && !e.target.closest('#userMenu')) {
            document.getElementById('userMenu').classList.remove('active');
        }
    });
    
    // Add Enter key support for message input
    document.getElementById('messageInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
});

// Animate statistics counters
function animateStats() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        // Start animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu
        document.getElementById('nav').classList.remove('active');
        
        // Close user menu
        document.getElementById('userMenu').classList.remove('active');
        
        // Special handling for certain sections
        if (sectionId === 'myprofile' && currentUser) {
            displayUserProfile();
        } else if (sectionId === 'visitors' && currentUser) {
            loadVisitors();
        } else if (sectionId === 'favorites' && currentUser) {
            updateFavoritesDisplay();
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    document.getElementById('nav').classList.toggle('active');
}

// Toggle user menu
function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('active');
}

// Load profiles with animation
function loadProfiles() {
    const grid = document.getElementById('profilesGrid');
    grid.innerHTML = profiles.map((profile, index) => 
        createProfileCard(profile, index * 100)
    ).join('');
}

// Create profile card HTML with animation delay
function createProfileCard(profile, delay = 0) {
    const interestTags = profile.interests.map(interest => 
        `<span class="interest-tag">${interest}</span>`
    ).join('');
    
    const verifiedBadge = profile.verified ? 
        '<i class="fas fa-check-circle" style="color: var(--info-color); margin-left: 0.5rem;" data-tooltip="Проверенный профиль"></i>' : '';
    
    return `
        <div class="profile-card fade-in" style="animation-delay: ${delay}ms" onclick="showProfile(${profile.id})">
            <div class="profile-header">
                <div class="profile-avatar">
                    ${profile.avatar}
                    ${profile.online ? '<span class="online-indicator"></span>' : ''}
                </div>
                <div>
                    <div class="profile-name">
                        ${profile.name}, <span class="profile-age">${profile.age} лет</span>
                        ${verifiedBadge}
                    </div>
                    <div class="profile-location"><i class="fas fa-map-marker-alt"></i> ${profile.city}</div>
                </div>
            </div>
            <div class="profile-quote">"${profile.quote}"</div>
            <div class="profile-interests">${interestTags}</div>
            <div class="profile-actions">
                <button class="btn btn-primary btn-small" onclick="handleMessage(event, ${profile.id})">
                    <i class="fas fa-envelope"></i> Написать
                </button>
                <button class="btn btn-secondary btn-small" onclick="handleFavorite(event, ${profile.id})">
                    <i class="fas fa-heart"></i> В избранное
                </button>
            </div>
        </div>
    `;
}

// Show profile details
function showProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    currentProfileId = profileId;
    
    // Add to visitors if logged in
    if (currentUser && !visitors.includes(profileId)) {
        visitors.push(profileId);
        saveToLocalStorage('visitors', visitors);
    }
    
    const lastSeenText = profile.online ? 
        'Сейчас онлайн' : 
        `Был(а) в сети ${formatLastSeen(profile.lastSeen)}`;
    
    document.getElementById('profileModalName').innerHTML = 
        `${profile.name}, ${profile.age} лет ${profile.verified ? '<i class="fas fa-check-circle" style="color: var(--info-color);"></i>' : ''}`;
    
    document.getElementById('profileModalContent').innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div class="profile-avatar" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto;">
                ${profile.avatar}
                ${profile.online ? '<span class="online-indicator"></span>' : ''}
            </div>
            <p style="color: ${profile.online ? 'var(--success-color)' : '#666'}; margin-top: 1rem;">
                <i class="fas fa-circle" style="font-size: 0.5rem;"></i> ${lastSeenText}
            </p>
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
        
        ${profile.photos && profile.photos.length > 0 ? `
            <div class="form-group">
                <strong>Фотографии:</strong>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                    ${profile.photos.map(photo => 
                        `<div style="aspect-ratio: 1; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 2rem; color: #ccc;"></i>
                        </div>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    showModal('profileModal');
}

// Format last seen time
function formatLastSeen(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `${minutes} ${getPlural(minutes, 'минуту', 'минуты', 'минут')} назад`;
    } else if (hours < 24) {
        return `${hours} ${getPlural(hours, 'час', 'часа', 'часов')} назад`;
    } else {
        return `${days} ${getPlural(days, 'день', 'дня', 'дней')} назад`;
    }
}

// Get plural form
function getPlural(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
}

// Handle message button
function handleMessage(event, profileId) {
    event.stopPropagation();
    if (!currentUser) {
        showNotification('Для отправки сообщений необходимо войти', 'warning');
        showModal('loginModal');
        return;
    }
    
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
        showSection('messages');
        showNotification(`Открыт чат с ${profile.name}`);
    }
}

// Handle favorite button
function handleFavorite(event, profileId) {
    event.stopPropagation();
    if (!currentUser) {
        showNotification('Для добавления в избранное необходимо войти', 'warning');
        showModal('loginModal');
        return;
    }
    
    const profile = profiles.find(p => p.id === profileId);
    
    if (favorites.includes(profileId)) {
        favorites = favorites.filter(id => id !== profileId);
        showNotification(`${profile.name} удален(а) из избранного`);
    } else {
        favorites.push(profileId);
        showNotification(`${profile.name} добавлен(а) в избранное`);
    }
    
    saveToLocalStorage('favorites', favorites);
    updateFavoritesDisplay();
}

// Send message to profile
function sendMessageToProfile() {
    if (!currentUser) {
        closeModal('profileModal');
        showModal('loginModal');
        return;
    }
    
    closeModal('profileModal');
    showSection('messages');
}

// Add profile to favorites
function addProfileToFavorites() {
    if (!currentUser) {
        closeModal('profileModal');
        showModal('loginModal');
        return;
    }
    
    if (currentProfileId && !favorites.includes(currentProfileId)) {
        favorites.push(currentProfileId);
        saveToLocalStorage('favorites', favorites);
        showNotification('Добавлено в избранное');
        updateFavoritesDisplay();
    }
}

// Report profile
function reportProfile() {
    if (!currentUser) {
        closeModal('profileModal');
        showModal('loginModal');
        return;
    }
    
    showNotification('Жалоба отправлена администратору', 'info');
    closeModal('profileModal');
}

// Update favorites display
function updateFavoritesDisplay() {
    const grid = document.getElementById('favoritesGrid');
    if (!favorites || favorites.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">У вас пока нет избранных анкет</p>';
    } else {
        const favoriteProfiles = profiles.filter(p => favorites.includes(p.id));
        grid.innerHTML = favoriteProfiles.map((profile, index) => 
            createProfileCard(profile, index * 100)
        ).join('');
    }
}

// Load visitors
function loadVisitors() {
    const grid = document.getElementById('visitorsGrid');
    if (!visitors || visitors.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Пока никто не просматривал вашу анкету</p>';
    } else {
        const visitorProfiles = profiles.filter(p => visitors.includes(p.id));
        grid.innerHTML = visitorProfiles.map((profile, index) => 
            createProfileCard(profile, index * 100)
        ).join('');
    }
}

// Login
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (email && password) {
        currentUser = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email,
            avatar: email[0].toUpperCase(),
            registeredAt: new Date()
        };
        
        saveToLocalStorage('currentUser', currentUser);
        updateAuthUI();
        closeModal('loginModal');
        showNotification('Вход выполнен успешно!');
        showSection('cabinet');
        
        // Load saved data
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    }
}

// Register
function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Пароль должен содержать минимум 8 символов', 'error');
        return;
    }
    
    if (name && email && password) {
        currentUser = {
            id: Date.now(),
            name: name,
            email: email,
            avatar: name[0].toUpperCase(),
            registeredAt: new Date()
        };
        
        saveToLocalStorage('currentUser', currentUser);
        updateAuthUI();
        closeModal('registerModal');
        showNotification('Регистрация успешна! Теперь создайте анкету.');
        showSection('create');
    }
}

// Update auth UI
function updateAuthUI() {
    if (currentUser) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').textContent = currentUser.avatar;
        
        // Update message counts
        updateMessageCounts();
    } else {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userInfo').style.display = 'none';
    }
}

// Update message counts
function updateMessageCounts() {
    const count = messageNotifications;
    document.getElementById('messagesCount').textContent = count;
    document.getElementById('cabinetMessagesCount').textContent = count;
    
    if (count > 0) {
        document.getElementById('messagesCount').style.display = 'inline-block';
        document.getElementById('cabinetMessagesCount').style.display = 'inline-block';
    } else {
        document.getElementById('messagesCount').style.display = 'none';
        document.getElementById('cabinetMessagesCount').style.display = 'none';
    }
}

// Logout
function logout() {
    currentUser = null;
    favorites = [];
    visitors = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('favorites');
    localStorage.removeItem('visitors');
    updateAuthUI();
    showNotification('Вы вышли из системы');
    showSection('home');
    document.getElementById('userMenu').classList.remove('active');
}

// Handle create profile
function handleCreateProfile() {
    if (!currentUser) {
        showNotification('Для создания анкеты необходимо войти', 'warning');
        showModal('loginModal');
        return;
    }
    
    showSection('create');
}

// Profile creation steps
function nextStep() {
    if (currentStep === 1 && uploadedPhotos.length === 0) {
        showNotification('Загрузите хотя бы одну фотографию', 'error');
        return;
    }
    
    if (currentStep === 2) {
        // Validate step 2 fields
        const form = document.getElementById('createProfileForm');
        const stepFields = form.querySelectorAll('#stepContent2 input[required], #stepContent2 select[required]');
        let valid = true;
        
        stepFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        if (!valid) {
            showNotification('Заполните все обязательные поля', 'error');
            return;
        }
    }
    
    if (currentStep < 3) {
        document.getElementById(`stepContent${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.add('completed');
        currentStep++;
        document.getElementById(`stepContent${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`stepContent${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`stepContent${currentStep}`).classList.add('active');
        document.getElementById(`step${currentStep}`).classList.remove('completed');
    }
}

// Photo upload
function triggerPhotoUpload(slotIndex) {
    currentPhotoSlot = slotIndex;
    document.getElementById('photoUpload').click();
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Размер файла не должен превышать 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const slots = document.querySelectorAll('.photo-slot');
        const slot = slots[currentPhotoSlot];
        
        // Store photo data
        uploadedPhotos[currentPhotoSlot] = {
            file: file,
            url: e.target.result
        };
        
        // Update slot display
        slot.classList.add('filled');
        slot.innerHTML = `
            <img src="${e.target.result}" alt="Photo ${currentPhotoSlot + 1}">
            <button class="remove-photo" onclick="removePhoto(event, ${currentPhotoSlot})">×</button>
        `;
        
        showNotification('Фотография загружена');
    };
    
    reader.readAsDataURL(file);
}

function removePhoto(event, slotIndex) {
    event.stopPropagation();
    
    delete uploadedPhotos[slotIndex];
    
    const slots = document.querySelectorAll('.photo-slot');
    const slot = slots[slotIndex];
    
    slot.classList.remove('filled');
    slot.innerHTML = `
        <i class="fas fa-${slotIndex === 0 ? 'camera' : 'plus'}"></i>
        <span>${slotIndex === 0 ? 'Главное фото' : 'Фото ' + (slotIndex + 1)}</span>
        <button class="remove-photo" onclick="removePhoto(event, ${slotIndex})">×</button>
    `;
    
    showNotification('Фотография удалена');
}

// Submit profile
function submitProfile(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Get selected interests
    const interests = [];
    formData.getAll('interests').forEach(interest => interests.push(interest));
    
    const profileData = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        city: formData.get('city'),
        churchStatus: formData.get('churchStatus'),
        maritalStatus: formData.get('maritalStatus'),
        education: formData.get('education'),
        profession: formData.get('profession'),
        about: formData.get('about'),
        seeking: formData.get('seeking'),
        interests: interests,
        photos: uploadedPhotos,
        createdAt: new Date()
    };
    
    // Store user profile
    currentUser.profile = profileData;
    saveToLocalStorage('currentUser', currentUser);
    
    showNotification('Анкета успешно создана!');
    showSection('cabinet');
    
    // Reset form
    event.target.reset();
    uploadedPhotos = [];
    currentStep = 1;
    
    // Reset steps UI
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index === 0);
    });
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('completed');
        step.classList.toggle('active', index === 0);
    });
    
    // Reset photo slots
    document.querySelectorAll('.photo-slot').forEach((slot, index) => {
        slot.classList.remove('filled');
        slot.innerHTML = `
            <i class="fas fa-${index === 0 ? 'camera' : 'plus'}"></i>
            <span>${index === 0 ? 'Главное фото' : 'Фото ' + (index + 1)}</span>
            <button class="remove-photo" onclick="removePhoto(event, ${index})">×</button>
        `;
    });
}

// Display user profile
function displayUserProfile() {
    const display = document.getElementById('profileDisplay');
    
    if (!currentUser.profile) {
        display.innerHTML = `
            <p style="font-size: 1.1rem; color: #666;">У вас еще нет анкеты.</p>
            <button class="btn btn-primary btn-large" onclick="showSection('create')" style="margin-top: 1rem;">
                <i class="fas fa-user-plus"></i> Создать анкету
            </button>
        `;
        return;
    }
    
    const profile = currentUser.profile;
    const photoHtml = profile.photos && profile.photos[0] 
        ? `<img src="${profile.photos[0].url}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; margin-bottom: 1rem; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">` 
        : `<div class="profile-avatar" style="width: 200px; height: 200px; font-size: 5rem; margin: 0 auto 1rem;">${currentUser.avatar}</div>`;
    
    display.innerHTML = `
        ${photoHtml}
        <h3 style="font-family: 'Montserrat', sans-serif; margin-bottom: 0.5rem;">${profile.name}, ${profile.age} лет</h3>
        <p style="color: #666; margin-bottom: 2rem;"><i class="fas fa-map-marker-alt"></i> ${profile.city}</p>
        
        <div style="text-align: left; max-width: 600px; margin: 0 auto;">
            <div class="form-group">
                <strong>Воцерковленность:</strong> ${profile.churchStatus}
            </div>
            <div class="form-group">
                <strong>Семейное положение:</strong> ${profile.maritalStatus}
            </div>
            ${profile.education ? `<div class="form-group"><strong>Образование:</strong> ${profile.education}</div>` : ''}
            ${profile.profession ? `<div class="form-group"><strong>Профессия:</strong> ${profile.profession}</div>` : ''}
            
            <div class="form-group">
                <strong>О себе:</strong>
                <p style="white-space: pre-wrap;">${profile.about}</p>
            </div>
            
            <div class="form-group">
                <strong>Кого ищу:</strong>
                <p style="white-space: pre-wrap;">${profile.seeking}</p>
            </div>
            
            ${profile.interests && profile.interests.length > 0 ? `
                <div class="form-group">
                    <strong>Интересы:</strong>
                    <div class="profile-interests" style="margin-top: 0.5rem;">
                        ${profile.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Edit profile
function editProfile() {
    showSection('create');
    // TODO: Load existing profile data into the form
}

// Search
function performSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const searchParams = {
        gender: formData.get('gender'),
        ageFrom: formData.get('ageFrom'),
        ageTo: formData.get('ageTo'),
        city: formData.get('city'),
        churchStatus: formData.get('churchStatus'),
        maritalStatus: formData.get('maritalStatus'),
        interests: formData.getAll('interests')
    };
    
    // Filter profiles based on search params
    let results = [...profiles];
    
    if (searchParams.gender) {
        results = results.filter(p => p.gender === searchParams.gender);
    }
    
    if (searchParams.ageFrom) {
        results = results.filter(p => p.age >= parseInt(searchParams.ageFrom));
    }
    
    if (searchParams.ageTo) {
        results = results.filter(p => p.age <= parseInt(searchParams.ageTo));
    }
    
    if (searchParams.city) {
        results = results.filter(p => p.city.toLowerCase().includes(searchParams.city.toLowerCase()));
    }
    
    if (searchParams.churchStatus) {
        results = results.filter(p => p.churchStatus === searchParams.churchStatus);
    }
    
    if (searchParams.maritalStatus) {
        results = results.filter(p => p.maritalStatus === searchParams.maritalStatus);
    }
    
    if (searchParams.interests.length > 0) {
        results = results.filter(p => 
            searchParams.interests.some(interest => p.interests.includes(interest))
        );
    }
    
    // Display results
    const resultsGrid = document.getElementById('searchResultsGrid');
    if (results.length === 0) {
        resultsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Не найдено анкет по вашим критериям. Попробуйте изменить параметры поиска.</p>';
    } else {
        resultsGrid.innerHTML = results.map((profile, index) => 
            createProfileCard(profile, index * 100)
        ).join('');
    }
    
    document.getElementById('searchResults').style.display = 'block';
    showNotification(`Найдено анкет: ${results.length}`);
    
    // Scroll to results
    document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}

// Load more profiles
function loadMoreProfiles() {
    showNotification('Загружаем больше анкет...', 'info');
    
    // Simulate loading more profiles
    setTimeout(() => {
        const newProfiles = [
            {
                id: profiles.length + 1,
                name: 'Ольга',
                age: 29,
                city: 'Ростов-на-Дону',
                avatar: 'О',
                gender: 'female',
                churchStatus: 'воцерковленная',
                maritalStatus: 'не замужем',
                online: false,
                lastSeen: new Date(Date.now() - 86400000),
                quote: 'Ищу православного мужчину для создания семьи в вере...',
                about: 'Работаю в православной гимназии, веду благотворительные проекты.',
                interests: ['благотворительность', 'чтение', 'природа'],
                education: 'высшее',
                profession: 'Педагог',
                photos: ['photo10.jpg'],
                verified: false
            },
            {
                id: profiles.length + 2,
                name: 'Сергей',
                age: 38,
                city: 'Нижний Новгород',
                avatar: 'С',
                gender: 'male',
                churchStatus: 'воцерковленный',
                maritalStatus: 'вдовец',
                online: true,
                lastSeen: new Date(),
                quote: 'После потери супруги ищу понимающую спутницу для создания новой семьи...',
                about: 'Воспитываю двоих детей. Активный прихожанин, помогаю в храме.',
                interests: ['паломничество', 'спорт', 'благотворительность'],
                education: 'высшее',
                profession: 'Предприниматель',
                photos: ['photo11.jpg', 'photo12.jpg'],
                verified: true
            }
        ];
        
        profiles.push(...newProfiles);
        loadProfiles();
        showNotification('Загружены новые анкеты');
        
        // Scroll to new profiles
        const grid = document.getElementById('profilesGrid');
        const newCards = grid.querySelectorAll('.profile-card:nth-last-child(-n+2)');
        if (newCards.length > 0) {
            newCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1000);
}

// Messages
function selectChat(chatId) {
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Clear notifications for this chat
    messageNotifications = Math.max(0, messageNotifications - 1);
    updateMessageCounts();
    
    // Load chat messages
    showNotification('Загружен чат');
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesArea = document.getElementById('messagesArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
    `;
    messagesArea.appendChild(messageDiv);
    
    input.value = '';
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    showNotification('Сообщение отправлено');
    
    // Simulate response after delay
    setTimeout(() => {
        const responses = [
            'Спасибо за сообщение! Обязательно отвечу позже.',
            'Интересно! Расскажите подробнее.',
            'Рад(а) знакомству!',
            'Благослови Господь!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseDiv = document.createElement('div');
        responseDiv.className = 'message';
        responseDiv.innerHTML = `
            <div class="message-content">${randomResponse}</div>
        `;
        messagesArea.appendChild(responseDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        messageNotifications++;
        updateMessageCounts();
        showNotification('Новое сообщение', 'info');
    }, 3000);
}

// Settings
function saveSettings() {
    const settings = {
        showInSearch: document.querySelector('input[type="checkbox"]:checked'),
        allowMessages: document.querySelectorAll('input[type="checkbox"]:checked')[1],
        hideOnlineStatus: document.querySelectorAll('input[type="checkbox"]:checked')[2],
        notifications: {
            messages: document.querySelectorAll('input[type="checkbox"]:checked')[3],
            favorites: document.querySelectorAll('input[type="checkbox"]:checked')[4],
            newProfiles: document.querySelectorAll('input[type="checkbox"]:checked')[5]
        }
    };
    
    saveToLocalStorage('settings', settings);
    showNotification('Настройки сохранены');
}

// Confirm delete account
function confirmDeleteAccount() {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
        logout();
        showNotification('Аккаунт удален', 'info');
    }
}

// Select subscription plan
function selectPlan(plan) {
    showNotification(`Выбран план: ${plan.toUpperCase()}. Перенаправление на страницу оплаты...`, 'info');
    
    // Simulate payment redirect
    setTimeout(() => {
        showNotification('Функция оплаты в разработке', 'warning');
    }, 2000);
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Add smooth scroll behavior for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Check for new messages periodically (simulation)
if (currentUser) {
    setInterval(() => {
        if (Math.random() > 0.9) { // 10% chance of new message
            messageNotifications++;
            updateMessageCounts();
            showNotification('У вас новое сообщение!', 'info');
        }
    }, 30000); // Check every 30 seconds
}

// Form validation styles
const style = document.createElement('style');
style.textContent = `
    .form-input.error {
        border-color: var(--danger-color) !important;
        animation: shake 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);