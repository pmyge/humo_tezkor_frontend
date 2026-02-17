import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import CategorySection from './CategorySection';
import Sidebar from './Sidebar';
import AuthDrawer from './AuthDrawer';
import ProfileEdit from './ProfileEdit';
import ProductDetail from './ProductDetail';
import LocationPicker from './LocationPicker';
import MapPicker from './MapPicker';
import { api } from '../api';
import './CategorySection.css';
import './ProfileEdit.css';
import './SearchBar.css';
import './ProductDetail.css'; // Also for shared components
import '../index.css';

const Shop = ({ language }) => {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For search in all products
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('home'); // 'home', 'all_categories', 'category_products', 'profile', 'favorites'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('punyo_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('punyo_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [cart, setCart] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const saved = localStorage.getItem('punyo_location');
        return saved ? JSON.parse(saved) : null;
    });
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [showCartSuccess, setShowCartSuccess] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const updateCurrentUser = (user) => {
        if (user) {
            const saved = localStorage.getItem('punyo_user');
            const current = saved ? JSON.parse(saved) : {};

            // If the incoming user object has real data (from backend), it should dominate.
            // Merge logic: new data wins for all shared keys.
            const merged = { ...current, ...user };

            // Specifically for names: if backend returns a default name but we have a real one locally, 
            // maybe we want to keep it? The user said "name qismi Ergashboy bo'lishi kerak", 
            // which is a real name from Telegram/Backend. 
            // So we just trust the incoming 'user' object if it comes from an API call result.

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
                    console.log('DEBUG: Backend user data fetched', userData);
                    // Force update local data with backend data to clear stale "Hffuf" or old phones
                    updateCurrentUser(userData);

                    const saved = localStorage.getItem('punyo_user');
                    const localUser = saved ? JSON.parse(saved) : {};

                    // Sync logic for name changes in Telegram
                    if (tgUser.first_name && tgUser.first_name !== userData.first_name) {
                        try {
                            const updated = await api.updateUser(tgUser.id, {
                                first_name: tgUser.first_name,
                                last_name: tgUser.last_name || '',
                                username: tgUser.username || ''
                            });
                            updateCurrentUser(updated || userData);
                        } catch (e) {
                            console.error('Name sync failed:', e);
                        }
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

    const toggleFavorite = (productId) => {
        const newFavorites = favorites.includes(productId)
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId];

        setFavorites(newFavorites);
        localStorage.setItem('punyo_favorites', JSON.stringify(newFavorites));
    };

    const handleAddToCart = (product, quantity) => {
        const newItem = {
            product_id: product.id,
            name: product.name,
            name_ru: product.name_ru,
            price: product.price,
            image: product.image,
            quantity: quantity
        };

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.product_id === product.id);
            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += quantity;
                return newCart;
            }
            return [...prevCart, newItem];
        });

        setSelectedProduct(null);
        setShowCartSuccess(true);
        setTimeout(() => setShowCartSuccess(false), 3000);
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleAutoLocation = () => {
        const telegram = window.Telegram?.WebApp;
        if (telegram && telegram.requestLocation) {
            telegram.requestLocation((data) => {
                if (data && data.location) {
                    const loc = {
                        latitude: data.location.latitude,
                        longitude: data.location.longitude,
                        address: 'Telegram Geolocation'
                    };
                    setSelectedLocation(loc);
                    localStorage.setItem('punyo_location', JSON.stringify(loc));
                    setShowLocationPicker(false);
                }
            });
        } else {
            navigator.geolocation.getCurrentPosition((pos) => {
                const loc = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address: 'Browser Geolocation'
                };
                setSelectedLocation(loc);
                localStorage.setItem('punyo_location', JSON.stringify(loc));
                setShowLocationPicker(false);
                if (isCheckingOut) {
                    setIsCheckingOut(false);
                    // We need to wait for state to update or pass the location directly
                    submitFullOrder(loc);
                }
            }, () => {
                alert(language === 'ru' ? 'Не удалось получить доступ к геопозиции' : 'Joylashuvni aniqliy olmadi');
            });
        }
    };

    const handleManualLocation = (data) => {
        // data from Leaflet is { lat, lng, address }
        const normalizedLocation = {
            latitude: data.lat,
            longitude: data.lng,
            address: data.address
        };
        setSelectedLocation(normalizedLocation);
        localStorage.setItem('punyo_location', JSON.stringify(normalizedLocation));
        setShowMapPicker(false);
        if (isCheckingOut) {
            setIsCheckingOut(false);
            submitFullOrder(normalizedLocation);
        }
    };

    const submitFullOrder = async (providedLocation = null) => {
        const locationToUse = providedLocation || selectedLocation;

        // 1. Check for Phone Number first
        if (!currentUser?.phone_number) {
            setIsCheckingOut(true);
            setIsAuthDrawerOpen(true);
            return;
        }

        // 2. Check for Location next
        if (!locationToUse) {
            setIsCheckingOut(true);
            setShowLocationPicker(true);
            return;
        }

        if (cart.length === 0) return;

        setIsSubmittingOrder(true);
        try {
            const orderData = {
                telegram_user_id: currentUser?.telegram_user_id,
                items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
                latitude: locationToUse.latitude,
                longitude: locationToUse.longitude,
                delivery_address: locationToUse.address,
                phone_number: currentUser?.phone_number
            };

            const response = await api.createOrder(orderData);
            if (response.id) {
                alert(language === 'ru' ? 'Заказ успешно оформлен!' : 'Buyurtma muvaffaqiyatli qabul qilindi!');
                setCart([]);
            }
        } catch (error) {
            console.error('Order submit error:', error);
            alert('Xatolik yuz berdi');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleSidebarItemClick = (id) => {
        if (id === 'profile') {
            if (currentUser && currentUser.phone_number) {
                setView('profile');
            } else {
                setIsAuthDrawerOpen(true);
            }
        } else if (id === 'favorites') {
            setSelectedCategory(null);
            setSelectedProduct(null);
            setView('favorites');
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
        if (selectedProduct) {
            return (
                <ProductDetail
                    product={selectedProduct}
                    language={language}
                    onBack={() => setSelectedProduct(null)}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                />
            );
        }

        if (searchQuery) {
            return (
                <div className="search-results">
                    <div className="category-title">
                        {language === 'ru' ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'QIDIRUV NATIJALARI'}
                    </div>
                    <ProductGrid
                        products={filteredProducts}
                        language={language}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        onProductClick={setSelectedProduct}
                    />
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

        if (view === 'favorites') {
            const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
            return (
                <div className="favorites-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ИЗБРАННОЕ' : 'SEVIMLIKLAR'}
                    </div>
                    <ProductGrid
                        products={favoriteProducts}
                        language={language}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        onProductClick={setSelectedProduct}
                    />
                </div>
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
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            onProductClick={setSelectedProduct}
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
                onClose={() => {
                    setIsAuthDrawerOpen(false);
                    setIsCheckingOut(false);
                }}
                language={language}
                onAuthenticated={(user) => {
                    updateCurrentUser(user);
                    if (isCheckingOut) {
                        // Phone registered, now move to location step
                        setShowLocationPicker(true);
                    } else {
                        setView('profile');
                    }
                }}
            />

            <header className="header">
                <div className="header-top">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
                        <span className="menu-icon">☰</span>
                    </button>
                    <h1>PUNYO MARKET</h1>
                    <button className="location-header-btn" onClick={() => setShowLocationPicker(true)}>
                        <span className="location-icon">📍</span>
                    </button>
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

            {cart.length > 0 && view === 'home' && !selectedProduct && (
                <div className="cart-summary-fixed">
                    <button className="cart-total-btn" onClick={submitFullOrder} disabled={isSubmittingOrder}>
                        <span className="cart-btn-icon">🛒</span>
                        <span className="cart-btn-text">
                            {isSubmittingOrder
                                ? (language === 'ru' ? 'Оформление...' : 'Yuborilmoqda...')
                                : cartTotal.toLocaleString() + ' UZS'}
                        </span>
                    </button>
                </div>
            )}

            {showCartSuccess && (
                <div className="cart-success-toast">
                    <div className="toast-content">
                        <span className="check-icon">✅</span>
                        <span>{language === 'ru' ? 'Товар добавлен в корзину!' : 'Mahsulot savatga qo\'shildi!'}</span>
                    </div>
                </div>
            )}

            {showLocationPicker && (
                <LocationPicker
                    language={language}
                    onCancel={() => setShowLocationPicker(false)}
                    onAutoLocation={handleAutoLocation}
                    onManualLocation={() => {
                        setShowLocationPicker(false);
                        setShowMapPicker(true);
                    }}
                />
            )}

            {showMapPicker && (
                <MapPicker
                    language={language}
                    onCancel={() => setShowMapPicker(false)}
                    onConfirm={handleManualLocation}
                />
            )}
        </div>
    );
};

export default Shop;
