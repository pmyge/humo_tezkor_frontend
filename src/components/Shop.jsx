import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import { api } from '../api';

const Shop = ({ language }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
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

    const filteredProducts = products.filter(product => {
        const name = language === 'ru' ? (product.name_ru || product.name) : product.name;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return <div className="loading">{language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...'}</div>;
    }

    return (
        <div className="shop-view">
            <header className="header">
                <h1>PUNYO MARKET</h1>
                <p className="subtitle">mini ilova</p>
            </header>

            <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={language === 'ru' ? 'Поиск товаров...' : 'Mahsulotlarni qidirish...'}
            />

            <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                language={language}
            />

            <div className="category-title">
                {language === 'ru'
                    ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                    : selectedCategory?.name?.toUpperCase()}
            </div>

            <ProductGrid products={filteredProducts} language={language} />
        </div>
    );
};

export default Shop;
