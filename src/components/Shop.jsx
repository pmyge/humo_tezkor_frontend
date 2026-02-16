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
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('punyo_user');
        return saved ? JSON.parse(saved) : null;
    });

    const updateCurrentUser = (user) => {
        if (user) {
            const saved = localStorage.getItem('punyo_user');
            const current = saved ? JSON.parse(saved) : {};

            // Define what we consider "default" or "not real" names
            const isDefaultName = (name) => {
                if (!name) return true;
                const defaults = ['Admin', 'User', 'Mehmon', 'Гость'];
                return defaults.includes(name);
            };

            const merged = { ...current, ...user };

            // Protect manual name: if incoming is default but local is real, keep local
            if (isDefaultName(user.first_name) && !isDefaultName(current.first_name)) {
                merged.first_name = current.first_name;
            }

            localStorage.setItem('punyo_user', JSON.stringify(merged));
            setCurrentUser(merged);
        } else {
            localStorage.removeItem('punyo_user');
            setCurrentUser(null);
        }
    };

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
                if (userData) {
                    const saved = localStorage.getItem('punyo_user');
                    const localUser = saved ? JSON.parse(saved) : {};

                    // Sync logic: Only sync from TG if BOTH backend and local names are default/empty
                    const hasRealNameBackend = userData.first_name && userData.first_name !== 'Admin' && userData.first_name !== 'User';
                    const hasRealNameLocal = localUser.first_name && localUser.first_name !== 'Admin' && localUser.first_name !== 'User';

                    if (!hasRealNameBackend && !hasRealNameLocal && tgUser.first_name) {
                        try {
                            const updated = await api.updateUser(tgUser.id, {
                                first_name: tgUser.first_name,
                                last_name: tgUser.last_name || ''
                            });
                            updateCurrentUser(updated || userData);
                        } catch (e) {
                            console.error('Name sync failed:', e);
                            updateCurrentUser(userData);
                        }
                    } else {
                        updateCurrentUser(userData);
                    }
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // On failure, updateCurrentUser will already use what's in localStorage
            if (!currentUser) {
                const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
                if (tgUser) {
                    updateCurrentUser({
                        telegram_user_id: tgUser.id,
                        first_name: tgUser.first_name,
                        last_name: tgUser.last_name,
                        username: tgUser.username
                    });
                }
            }
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
                        updateCurrentUser(updated);
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
                user={currentUser}
            />

            <AuthDrawer
                isOpen={isAuthDrawerOpen}
                onClose={() => setIsAuthDrawerOpen(false)}
                language={language}
                onAuthenticated={(user) => {
                    updateCurrentUser(user);
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
