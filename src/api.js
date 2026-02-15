const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/products/categories/`);
        return response.json();
    },

    async getCategoryProducts(categoryId) {
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}/products/`);
        return response.json();
    }
};
