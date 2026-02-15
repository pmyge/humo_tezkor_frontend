import React, { useState, useEffect } from 'react';
import './App.css';
import CategoryList from './components/CategoryList';
import ProductGrid from './components/ProductGrid';
import SearchBar from './components/SearchBar';
import { api } from './api';

function App() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();

        // Initialize Telegram WebApp
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.MainButton.hide();
        }
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadProducts(selectedCategory.id);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
            if (data.length > 0) {
                setSelectedCategory(data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading categories:', error);
            setLoading(false);
        }
    };

    const loadProducts = async (categoryId) => {
        try {
            const data = await api.getCategoryProducts(categoryId);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name_ru.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Yuklanmoqda...</div>;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>PUNYO MARKET</h1>
                <p className="subtitle">mini ilova</p>
            </header>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            <div className="category-title">
                {selectedCategory?.name?.toUpperCase()}
            </div>

            <ProductGrid products={filteredProducts} />
        </div>
    );
}

export default App;
