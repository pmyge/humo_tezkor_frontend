const API_BASE_URL = 'https://punyo-market-backend.onrender.com/api';

const fetchWithBypass = async (url, options = {}) => {
    const headers = {
        ...options.headers,
        'bypass-tunnel-reminder': 'true',
    };
    return fetch(url, { ...options, headers });
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    return `${base}${path}`;
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

    // User Profile
    async getUserInfo(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/me/?telegram_user_id=${telegramUserId}`);
        if (!response.ok) return null;
        return response.json();
    },

    async registerPhone(telegramUserId, phoneNumber) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/phone-verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId,
                phone_number: phoneNumber
            })
        });
        return response.json();
    },

    // Orders
    async getOrders(telegramUserId, activeOnly = false) {
        const url = activeOnly
            ? `${API_BASE_URL}/orders/active/?telegram_user_id=${telegramUserId}`
            : `${API_BASE_URL}/orders/?telegram_user_id=${telegramUserId}`;
        const response = await fetchWithBypass(url);
        return response.json();
    }
};


