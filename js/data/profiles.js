// Profiles data module

export const profilesData = {
    profiles: [],
    loaded: false,
    loading: false,

    // Lazy load profiles data
    async load() {
        if (this.loaded) {
            return this.profiles;
        }

        if (this.loading) {
            // Wait for existing load to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.loaded) {
                        clearInterval(checkInterval);
                        resolve(this.profiles);
                    }
                }, 100);
            });
        }

        this.loading = true;

        try {
            // In production, this would be an API call
            // For now, return static data
            this.profiles = await this.getStaticProfiles();
            this.loaded = true;
            this.loading = false;
            return this.profiles;
        } catch (error) {
            console.error('Failed to load profiles:', error);
            this.loading = false;
            return [];
        }
    },

    // Get static profiles (simulating API response)
    async getStaticProfiles() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return [
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
                profession: 'Преподаватель',
                photos: ['/images/profiles/maria1.jpg', '/images/profiles/maria2.jpg'],
                lastSeen: new Date()
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
                profession: 'Инженер',
                photos: ['/images/profiles/alex1.jpg'],
                lastSeen: new Date()
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
                profession: 'Медсестра',
                photos: ['/images/profiles/elena1.jpg'],
                lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
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
                quote: 'После развода нашел утешение в вере. Ищу верующую спутницу для новой семьи...',
                about: 'Имею церковный развод. Воспитываю сына. Регулярно посещаю храм, участвую в паломничествах.',
                interests: ['паломничество', 'спорт', 'путешествия'],
                education: 'высшее',
                profession: 'Врач',
                photos: ['/images/profiles/dmitry1.jpg'],
                lastSeen: new Date(Date.now() - 7200000) // 2 hours ago
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
                quote: 'Ищу серьезного православного мужчину для создания большой семьи...',
                about: 'Пою на клиросе, веду занятия в воскресной школе. Мечтаю о большой православной семье.',
                interests: ['церковное пение', 'благотворительность', 'чтение'],
                education: 'высшее',
                profession: 'Учитель',
                photos: ['/images/profiles/anna1.jpg', '/images/profiles/anna2.jpg'],
                lastSeen: new Date()
            }
        ];
    },

    // Filter profiles
    filter(criteria) {
        let filtered = [...this.profiles];

        if (criteria.gender) {
            filtered = filtered.filter(p => p.gender === criteria.gender);
        }

        if (criteria.ageFrom) {
            filtered = filtered.filter(p => p.age >= criteria.ageFrom);
        }

        if (criteria.ageTo) {
            filtered = filtered.filter(p => p.age <= criteria.ageTo);
        }

        if (criteria.city) {
            filtered = filtered.filter(p => 
                p.city.toLowerCase().includes(criteria.city.toLowerCase())
            );
        }

        if (criteria.churchStatus) {
            filtered = filtered.filter(p => p.churchStatus === criteria.churchStatus);
        }

        if (criteria.maritalStatus) {
            filtered = filtered.filter(p => p.maritalStatus === criteria.maritalStatus);
        }

        if (criteria.interests && criteria.interests.length > 0) {
            filtered = filtered.filter(p => 
                criteria.interests.some(interest => p.interests.includes(interest))
            );
        }

        return filtered;
    },

    // Get profile by ID
    getById(id) {
        return this.profiles.find(p => p.id === id);
    },

    // Get online profiles
    getOnline() {
        return this.profiles.filter(p => p.online);
    },

    // Get recommended profiles (simple algorithm)
    getRecommended(userId, limit = 5) {
        // In production, this would use a recommendation algorithm
        return this.profiles
            .filter(p => p.id !== userId)
            .slice(0, limit);
    },

    // Update last seen
    updateLastSeen(userId) {
        const profile = this.profiles.find(p => p.id === userId);
        if (profile) {
            profile.lastSeen = new Date();
            profile.online = true;
        }
    },

    // Add view to profile
    addView(profileId, viewerId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (profile) {
            if (!profile.views) {
                profile.views = [];
            }
            profile.views.push({
                viewerId,
                timestamp: new Date()
            });
        }
    }
};