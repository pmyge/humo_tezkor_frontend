import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import CategorySection from './CategorySection';
import Sidebar from './Sidebar';
import AuthDrawer from './AuthDrawer';
import ProfileEdit from './ProfileEdit';
import { api } from '../api';
import './CategorySection.css';
import './ProfileEdit.css';
import './SearchBar.css';
import '../index.css';

const Shop = ({ language }) => {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For search in all products
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('home'); // 'home', 'all_categories', 'category_products', 'profile'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadCategories();
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const telegram = window.Telegram?.WebApp;
            const tgUser = telegram?.initDataUnsafe?.user;
            if (tgUser) {
                const userData = await api.getUserInfo(tgUser.id);
                if (userData && userData.phone_number) {
                    // Force sync name from Telegram if it's Admin or empty
                    const realName = tgUser.first_name || '';
                    if ((!userData.first_name || userData.first_name === 'Admin') && realName) {
                        try {
                            const updated = await api.updateUser(tgUser.id, {
                                first_name: realName,
                                last_name: tgUser.last_name || ''
                            });
                            setCurrentUser(updated || userData);
                        } catch (e) {
                            console.error('Name sync failed:', e);
                            setCurrentUser(userData);
                        }
                    } else {
                        setCurrentUser(userData);
                    }
                } else if (userData) {
                    // Still set current user if found, even if no phone yet
                    setCurrentUser(userData);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            setView('category_products');
            loadCategoryProducts(selectedCategory.id);
        } else {
            setView('home');
        }
    }, [selectedCategory]);

    const handleSidebarItemClick = (id) => {
        if (id === 'profile') {
            if (currentUser && currentUser.phone_number) {
                setView('profile');
            } else {
                setIsAuthDrawerOpen(true);
            }
        }
    };

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading categories:', error);
            setLoading(false);
        }
    };

    const loadCategoryProducts = async (categoryId) => {
        try {
            const data = await api.getCategoryProducts(categoryId);
            setAllProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const filteredProducts = allProducts.filter(product => {
        const name = language === 'ru' ? (product.name_ru || product.name) : product.name;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return <div className="loading">{language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...'}</div>;
    }

    const renderContent = () => {
        if (searchQuery) {
            return (
                <div className="search-results">
                    <div className="category-title">
                        {language === 'ru' ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'QIDIRUV NATIJALARI'}
                    </div>
                    <ProductGrid products={filteredProducts} language={language} />
                </div>
            );
        }

        if (view === 'all_categories') {
            return (
                <div className="all-categories-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ВСЕ КАТЕГОРИИ' : 'BARCHA KATEGORIYALAR'}
                    </div>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-item-large" onClick={() => setSelectedCategory(cat)}>
                                <div className="category-image-container">
                                    {cat.image ? <img src={api.getImageUrl(cat.image)} alt={cat.name} /> : <span>📦</span>}
                                </div>
                                <span>{language === 'ru' ? (cat.name_ru || cat.name) : cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (view === 'category_products' && selectedCategory) {
            return (
                <div className="detail-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setSelectedCategory(null)}>←</span>
                        {language === 'ru'
                            ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                            : selectedCategory?.name?.toUpperCase()}
                    </div>
                    <ProductGrid products={filteredProducts} language={language} />
                </div>
            );
        }

        if (view === 'profile' && currentUser) {
            return (
                <ProfileEdit
                    user={currentUser}
                    language={language}
                    onBack={() => setView('home')}
                    onSave={(updated) => {
                        setCurrentUser(updated);
                        setView('home');
                    }}
                />
            );
        }

        // Default: Home View
        return (
            <div className="home-content">
                <CategoryList
                    categories={categories}
                    selectedCategory={null}
                    onSelectCategory={setSelectedCategory}
                    onShowAllCategories={() => setView('all_categories')}
                    language={language}
                />

                <div className="featured-sections">
                    {categories.slice(0, 6).map(category => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            language={language}
                            onSelectCategory={setSelectedCategory}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`shop-view ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                language={language}
                onLanguageChange={async (lang) => {
                    // Update local state
                    window.dispatchEvent(new CustomEvent('langChange', { detail: lang }));
                    // Update backend if user is logged in
                    if (currentUser) {
                        try {
                            await api.changeLanguage(currentUser.telegram_user_id, lang);
                        } catch (e) {
                            console.error('Failed to sync language to backend:', e);
                        }
                    }
                }}
                onItemClick={handleSidebarItemClick}
            />

            <AuthDrawer
                isOpen={isAuthDrawerOpen}
                onClose={() => setIsAuthDrawerOpen(false)}
                language={language}
                onAuthenticated={(user) => {
                    setCurrentUser(user);
                    setView('profile');
                }}
            />

            <header className="header">
                <div className="header-top">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
                        <span className="menu-icon">☰</span>
                    </button>
                    <h1>PUNYO MARKET</h1>
                    <div className="header-placeholder"></div>
                </div>
                <p className="subtitle">mini ilova</p>
            </header>

            <div className="search-container">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={language === 'ru' ? 'Поиск товаров...' : 'Mahsulotlarni qidirish...'}
                />
            </div>

            {renderContent()}
        </div>
    );
};

export default Shop;
