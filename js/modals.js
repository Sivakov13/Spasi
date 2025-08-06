// Modals loader module

export function loadModal(modalId) {
    const modalsContainer = document.getElementById('modalsContainer');
    
    switch(modalId) {
        case 'loginModal':
            modalsContainer.innerHTML += createLoginModal();
            break;
        case 'registerModal':
            modalsContainer.innerHTML += createRegisterModal();
            break;
        case 'profileModal':
            modalsContainer.innerHTML += createProfileModal();
            break;
        default:
            console.warn('Unknown modal:', modalId);
    }
    
    // Set up event listeners for the new modal
    setupModalEventListeners(modalId);
}

function createLoginModal() {
    return `
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Вход</h2>
                    <button class="modal-close" onclick="closeModal('loginModal')">&times;</button>
                </div>
                
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" required id="loginEmail">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Пароль</label>
                        <input type="password" class="form-input" required id="loginPassword">
                    </div>
                    
                    <label class="checkbox-label">
                        <input type="checkbox"> Запомнить меня
                    </label>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </button>
                    
                    <p style="text-align: center; margin-top: 1rem;">
                        <a href="#" style="color: #e91e63;">Забыли пароль?</a>
                    </p>
                    
                    <hr style="margin: 1.5rem 0;">
                    
                    <p style="text-align: center;">
                        Нет аккаунта? <a href="#" onclick="closeModal('loginModal'); showModal('registerModal')" style="color: #e91e63;">Зарегистрируйтесь</a>
                    </p>
                </form>
            </div>
        </div>
    `;
}

function createRegisterModal() {
    return `
        <div id="registerModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Регистрация</h2>
                    <button class="modal-close" onclick="closeModal('registerModal')">&times;</button>
                </div>
                
                <form onsubmit="handleRegister(event)">
                    <div class="form-group">
                        <label class="form-label">Имя</label>
                        <input type="text" class="form-input" required id="registerName">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" required id="registerEmail">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Пароль</label>
                        <input type="password" class="form-input" required id="registerPassword">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Подтвердите пароль</label>
                        <input type="password" class="form-input" required id="registerPasswordConfirm">
                    </div>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" required> Я согласен с правилами платформы
                    </label>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i> Зарегистрироваться
                    </button>
                    
                    <hr style="margin: 1.5rem 0;">
                    
                    <p style="text-align: center;">
                        Есть аккаунт? <a href="#" onclick="closeModal('registerModal'); showModal('loginModal')" style="color: #e91e63;">Войдите</a>
                    </p>
                </form>
            </div>
        </div>
    `;
}

function createProfileModal() {
    return `
        <div id="profileModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="profileModalName">Имя профиля</h2>
                    <button class="modal-close" onclick="closeModal('profileModal')">&times;</button>
                </div>
                
                <div id="profileModalContent">
                    <!-- Profile details will be loaded here -->
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="sendMessageToProfile()">
                        <i class="fas fa-envelope"></i> Написать
                    </button>
                    <button class="btn btn-secondary" onclick="addProfileToFavorites()">
                        <i class="fas fa-heart"></i> В избранное
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupModalEventListeners(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
}

// Global functions
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.handleLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (window.app.login(email, password)) {
        closeModal('loginModal');
        window.showNotification('Вход выполнен успешно!');
        window.showSection('cabinet');
    } else {
        window.showNotification('Ошибка входа', 'error');
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        window.showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    // In real app, this would be an API call
    if (window.app.login(email, password)) {
        window.app.state.currentUser.name = name;
        closeModal('registerModal');
        window.showNotification('Регистрация успешна! Теперь создайте анкету.');
        window.showSection('create');
    }
};

window.sendMessageToProfile = function() {
    if (!window.app.state.currentUser) {
        closeModal('profileModal');
        showModal('loginModal');
        return;
    }
    
    closeModal('profileModal');
    window.showSection('messages');
};

window.addProfileToFavorites = function() {
    if (!window.app.state.currentUser) {
        closeModal('profileModal');
        showModal('loginModal');
        return;
    }
    
    const profileId = window.app.state.currentProfileId;
    if (profileId && !window.app.state.favorites.includes(profileId)) {
        window.app.state.favorites.push(profileId);
        window.showNotification('Добавлено в избранное');
    }
};