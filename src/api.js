const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://punyo-market-backend.onrender.com/api';

const fetchWithBypass = async (url, options = {}) => {
    const headers = {
        ...options.headers,
        'bypass-tunnel-reminder': 'true',
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { detail: response.statusText };
        }
        const error = new Error(errorData.detail || errorData.error || JSON.stringify(errorData) || `API error: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    return response;
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

    // User Profile
    async getUserInfo(telegramUserId) {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/me/?telegram_user_id=${telegramUserId}`);
        if (!response.ok) return null;
        return response.json();
    },

    async registerPhone(telegramUserId, phoneNumber, firstName = '', lastName = '') {
        const response = await fetchWithBypass(`${API_BASE_URL}/users/phone-verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_user_id: telegramUserId,
                phone_number: phoneNumber,
                first_name: firstName,
                last_name: lastName
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
    }
}


