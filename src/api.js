const API_BASE_URL = 'https://beige-sheep-slide.loca.lt/api';

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
