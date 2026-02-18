const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://punyo-market-backend.onrender.com/api';

const fetchWithBypass = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.error('API Timeout:', url);
            throw new Error('Connection timeout');
        }
        console.error('Fetch error:', err);
        throw err;
    }
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export const api = {
    async getCategories() {
        const response = await fetchWithBypass(`${API_BASE_URL}/products/categories/`);
        return response.json();
    },

    async getCategoryProducts(categoryId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/products/category/${categoryId}/products/`);
        return response.json();
    },

    async getAllProducts() {
        const response = await fetchWithBypass(`${API_BASE_URL}/products/all/`);
        return response.json();
    },

    // User Profile
    async getUserInfo(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/me/?telegram_user_id=${telegramUserId}`);
        if (!response.ok) return null;
        return response.json();
    },

    async registerPhone(telegramUserId, phoneNumber, firstName = '', lastName = '', username = '') {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/phone-verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId,
                phone_number: phoneNumber,
                first_name: firstName,
                last_name: lastName,
                username: username
            })
        });
        return response.json();
    },

    // Orders
    async getOrders(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/orders/?telegram_user_id=${telegramUserId}`);
        return response.json();
    },

    async getActiveOrders(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/orders/active/?telegram_user_id=${telegramUserId}`);
        return response.json();
    },

    async getConfirmedOrders(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/orders/confirmed/?telegram_user_id=${telegramUserId}`);
        return response.json();
    },

    async updateUser(telegramUserId, data) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/me/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId,
                ...data
            })
        });
        return response.json();
    },

    async deleteAccount(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/me/`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId
            })
        });
        return response.ok;
    },

    async changeLanguage(telegramUserId, language) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/language/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId,
                language: language
            })
        });
        return response.json();
    },

    async createOrder(orderData) {
        const response = await fetchWithBypass(`${API_BASE_URL}/orders/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },

    async getNotifications(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/notifications/?telegram_user_id=${telegramUserId}`);
        return response.json();
    },

    markNotificationRead: async (telegram_user_id, notificationId) => {
        const response = await fetch(`${API_BASE_URL}/users/notifications/mark-read/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_user_id, notification_id: notificationId })
        });
        return response.json();
    },

    async getAbout() {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/about/`);
        return response.json();
    },
};
