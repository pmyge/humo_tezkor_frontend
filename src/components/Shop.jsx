import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategoryList from './CategoryList';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import CategorySection from './CategorySection';
import Sidebar from './Sidebar';
import AuthDrawer from './AuthDrawer';
import MyOrders from './MyOrders';
import Notifications from './Notifications';
import AboutUs from './AboutUs';
import ProfileEdit from './ProfileEdit';
import ProductDetail from './ProductDetail';
import LocationPicker from './LocationPicker';
import MapPicker from './MapPicker';
import SuccessModal from './SuccessModal';
import Pagination from './Pagination';
import ChatSupport from './ChatSupport';
import { api } from '../api';
import './CategorySection.css';
import './ProfileEdit.css';
import './SearchBar.css';
import './ProductDetail.css'; // Also for shared components
import '../index.css';

const Shop = ({ language }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For search in all products
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(() => {
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
        if (path.includes('/orders')) return 'my_orders';
        if (path.includes('/chat')) return 'chat';
        return 'home';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('punyo_user');
        if (saved) {
            const data = JSON.parse(saved);
            // CRITICAL: Purge any legacy fallback IDs (9,000,000,000+)
            if (data?.telegram_user_id && parseInt(data.telegram_user_id) >= 9000000000) {
                console.warn('DEBUG: Purged legacy fallback identity from storage');
                localStorage.removeItem('punyo_user');
                return null;
            }
            return data;
        }
        return null;
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [aboutData, setAboutData] = useState(null);

    useEffect(() => {
        loadAboutData();
    }, []);

    // Sync view with URL path
    useEffect(() => {
        const path = location.pathname.toLowerCase().replace(/\/$/, '');
        if (path.includes('/orders')) {
            setView('my_orders');
        } else if (path.includes('/chat')) {
            setView('chat');
        } else if (path === '' || path === '/') {
            setView('home');
        }
    }, [location.pathname]);

    const loadAboutData = async () => {
        try {
            const data = await api.getAbout();
            if (data) {
                setAboutData(data);
            } else {
                throw new Error('Empty response');
            }
        } catch (error) {
            console.error('Failed to load about data:', error);
            // Fallback default data to stop infinite loading if API fails
            setAboutData({
                phone_number: '+998XXXXXXXXX',
                email: 'shop@example.com',
                address: 'Do\'stlik, Jizzax'
            });
        }
    };
    const [categoryPage, setCategoryPage] = useState(1);

    const updateCurrentUser = (user, source = 'local') => {
        if (user) {
            // CRITICAL: Block any 9bn+ IDs from being saved
            const tid = user.telegram_user_id || (user.id && user.id < 9000000000 ? user.id : null);
            if (tid && parseInt(tid) >= 9000000000) {
                console.error('DEBUG: BLOCKING save of legacy fallback ID:', tid);
                localStorage.removeItem('punyo_user');
                setCurrentUser(null);
                return;
            }

            const saved = localStorage.getItem('punyo_user');
            const current = saved ? JSON.parse(saved) : {};

            // Clean data: if phone_number is "-" or null, treat as empty string
            if (user.phone_number === '-' || user.phone_number === null) {
                user.phone_number = '';
            }

            const merged = source === 'backend'
                ? { ...user }
                : { ...current, ...user };

            console.log(`DEBUG updateCurrentUser (source: ${source}):`, merged);
            localStorage.setItem('punyo_user', JSON.stringify(merged));
            setCurrentUser(merged);
        } else {
            localStorage.removeItem('punyo_user');
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        loadCategories();
        loadAllProducts();
        checkAuth();
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser?.telegram_user_id]);

    const loadNotifications = async () => {
        if (!currentUser?.telegram_user_id) return;
        try {
            const data = await api.getNotifications(currentUser.telegram_user_id);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        if (!currentUser?.telegram_user_id) return;
        try {
            await api.markNotificationRead(currentUser.telegram_user_id, notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const checkAuth = async () => {
        let retries = 0;
        const maxRetries = 5; // Increased retries

        const attemptAuth = async () => {
            try {
                const telegram = window.Telegram?.WebApp;

                // Priority 0: URL Query Parameter 'tid' (Foolproof fallback from Bot)
                const urlParams = new URLSearchParams(window.location.search);
                const tidParam = urlParams.get('tid');
                let tgUser = tidParam && parseInt(tidParam) > 0 ? { id: parseInt(tidParam) } : telegram?.initDataUnsafe?.user;

                // Priority 2: Manual parse of initData from URL hash (most robust fallback)
                if (!tgUser || !tgUser.id) {
                    try {
                        const hash = window.location.hash.slice(1);
                        const hashParams = new URLSearchParams(hash);
                        const tgWebAppData = hashParams.get('tgWebAppData');
                        const source = tgWebAppData ? new URLSearchParams(tgWebAppData) : hashParams;

                        const userRaw = source.get('user');
                        if (userRaw) tgUser = JSON.parse(userRaw);

                        // Also check for 'tid' in hash just in case of weird routing
                        const tidHash = source.get('tid');
                        if (tidHash && parseInt(tidHash) > 0) tgUser = { id: parseInt(tidHash) };
                    } catch (e) { }
                }

                // Aggressive backup: parse from initData string (useful for some clients/reload scenarios)
                if (!tgUser && telegram?.initData) {
                    try {
                        const params = new URLSearchParams(telegram.initData);
                        const userRaw = params.get('user');
                        if (userRaw) tgUser = JSON.parse(userRaw);
                    } catch (e) {
                        console.warn('DEBUG: Failed to parse initData string', e);
                    }
                }

                console.log(`DEBUG: checkAuth attempt ${retries + 1}, tgUser:`, tgUser);

                if (tgUser && tgUser.id && parseInt(tgUser.id) < 9000000000) {
                    try {
                        const userData = await api.getUserInfo(tgUser.id);
                        if (userData) {
                            if (userData.is_registered === false) {
                                console.log('DEBUG: User exists as guest only. Clearing local auth.');
                                updateCurrentUser(null);
                                return false;
                            }
                            if (userData.language && userData.language !== language) {
                                window.dispatchEvent(new CustomEvent('langChange', { detail: userData.language }));
                            }
                            updateCurrentUser(userData, 'backend');
                            return true;
                        }
                    } catch (e) {
                        console.warn('Backend check failed, using provisional local identity');
                    }

                    // Fallback to local/tg identity if backend is slow/offline but we HAVE tgUser
                    updateCurrentUser({
                        telegram_user_id: tgUser.id,
                        first_name: tgUser.first_name,
                        last_name: tgUser.last_name,
                        username: tgUser.username
                    }, 'telegram');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Auth check error:', error);
                return false;
            }
        };

        let success = await attemptAuth();
        while (!success && retries < maxRetries) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500));
            success = await attemptAuth();
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            setView('category_products');
            setCategoryPage(1); // Reset to first page
            loadCategoryProducts(selectedCategory.id);
        } else if (view === 'category_products' || view === 'all_categories') {
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
                    if (isCheckingOut) {
                        setIsCheckingOut(false);
                        submitFullOrder(loc);
                    }
                }
            }, (err) => {
                console.error('Geolocation error:', err);
                alert(language === 'ru' ? 'Не удалось получить ваше местоположение' : 'Joylashuvingizni aniqlab bo\'lmadi');
            });
        } else if (navigator.geolocation) {
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
                    submitFullOrder(loc);
                }
            }, () => {
                alert(language === 'ru' ? 'Не удалось получить доступ к геопозиции' : 'Joylashuvni aniqliy olmadi');
            });
        }
    };

    const handleManualLocation = (data) => {
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
        // Fix: If this is called from an onClick event, providedLocation will be the Event object.
        const locationToUse = (providedLocation && providedLocation.latitude) ? providedLocation : selectedLocation;

        // 1. Check for Phone Number first
        // We consider it missing if it's null, empty, or just a dash "-"
        const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '-';

        if (!hasPhone) {
            console.log('DEBUG: No valid phone number, opening AuthDrawer');
            setIsCheckingOut(true);
            setIsAuthDrawerOpen(true);
            return;
        }

        // 2. Check for Location next
        if (!locationToUse || !locationToUse.latitude) {
            console.log('DEBUG: No valid location, opening LocationPicker');
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
                setShowSuccessModal(true);
                setCart([]);
            }
        } catch (error) {
            console.error('Order submit error:', error);
            alert(language === 'ru' ? 'Произошла ошибка' : 'Xatolik yuz berdi');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleSidebarItemClick = async (id) => {
        const query = location.search;
        if (id === 'profile') {
            const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '' && currentUser.phone_number !== '-';
            if (hasPhone) {
                navigate('/' + query); // Profile is part of home view but needs to trigger effect or state
                setView('profile');
            } else {
                setIsAuthDrawerOpen(true);
            }
        } else if (id === 'orders') {
            const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '' && currentUser.phone_number !== '-';
            if (hasPhone) {
                navigate('/orders' + query);
                // setView is handled by useEffect on location change
            } else {
                setIsAuthDrawerOpen(true);
            }
        } else if (id === 'favorites') {
            setFavoritesPage(1);
            setView('favorites');
            navigate('/' + query);
        } else if (id === 'notifications') {
            setView('notifications');
            loadNotifications();
            navigate('/' + query);
        } else if (id === 'about') {
            setView('about');
            loadAboutData();
            navigate('/' + query);
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

    const loadAllProducts = async () => {
        try {
            const data = await api.getAllProducts();
            setAllProducts(data);
        } catch (error) {
            console.error('Error loading all products:', error);
        }
    };

    const loadCategoryProducts = async (categoryId) => {
        try {
            const data = await api.getCategoryProducts(categoryId);
            // Also update allProducts pool if needed, or just set filtered view
            // For now, we use allProducts as the source for search and favorites
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const filteredProducts = allProducts.filter(product => {
        const name = language === 'ru' ? (product.name_ru || product.name) : product.name;
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        if (view === 'category_products' && selectedCategory) {
            return matchesSearch && product.category === selectedCategory.id;
        }
        return matchesSearch;
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
                    selectedLocation={selectedLocation}
                    onShowLocationPicker={() => setShowLocationPicker(true)}
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
                        onProductClick={(p) => {
                            if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                setPendingProduct(p);
                                setIsAuthDrawerOpen(true);
                            } else {
                                setSelectedProduct(p);
                            }
                        }}
                    />
                </div>
            );
        }

        if (view === 'all_categories') {
            return (
                <div className="all-categories-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ВСE КАТЕГОРИИ' : 'BARCHA KATEGORIYALAR'}
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
            const itemsPerPage = 12;
            const startIndex = (categoryPage - 1) * itemsPerPage;
            const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

            return (
                <div className="detail-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setSelectedCategory(null)}>←</span>
                        {language === 'ru'
                            ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                            : selectedCategory?.name?.toUpperCase()}
                    </div>
                    <ProductGrid
                        products={paginatedProducts}
                        language={language}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        onProductClick={(p) => {
                            if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                setPendingProduct(p);
                                setIsAuthDrawerOpen(true);
                            } else {
                                setSelectedProduct(p);
                            }
                        }}
                    />
                    <Pagination
                        currentPage={categoryPage}
                        totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCategoryPage}
                    />
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
                        if (updated === null) {
                            updateCurrentUser(null);
                        } else {
                            updateCurrentUser(updated);
                        }
                        setView('home');
                    }}
                />
            );
        }

        if (view === 'chat') {
            if (currentUser) {
                return <ChatSupport user={currentUser} language={language} onBack={() => setView('home')} />;
            }
            return <div className="loading">{language === 'ru' ? 'Загрузка чата...' : 'Chat yuklanmoqda...'}</div>;
        }

        if (view === 'my_orders') {
            if (currentUser) {
                return (
                    <MyOrders
                        user={currentUser}
                        language={language}
                        onBack={() => setView('home')}
                    />
                );
            }
            return <div className="loading">{language === 'ru' ? 'Загрузка заказов...' : 'Buyurtmalar yuklanmoqda...'}</div>;
        }

        if (view === 'notifications') {
            return (
                <Notifications
                    notifications={notifications}
                    language={language}
                    onMarkRead={handleMarkAsRead}
                    onBack={() => setView('home')}
                />
            );
        }

        if (view === 'about') {
            return <AboutUs about={aboutData} language={language} onBack={() => setView('home')} />;
        }

        if (view === 'favorites') {
            const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
            const itemsPerPage = 10;
            const startIndex = (favoritesPage - 1) * itemsPerPage;
            const paginatedFavorites = favoriteProducts.slice(startIndex, startIndex + itemsPerPage);

            return (
                <div className="favorites-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ИЗБРАННОЕ' : 'SEVIMLILAR'}
                    </div>
                    {favoriteProducts.length > 0 ? (
                        <>
                            <ProductGrid
                                products={paginatedFavorites}
                                language={language}
                                favorites={favorites}
                                onToggleFavorite={toggleFavorite}
                                onProductClick={(p) => {
                                    if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                        setPendingProduct(p);
                                        setIsAuthDrawerOpen(true);
                                    } else {
                                        setSelectedProduct(p);
                                    }
                                }}
                            />
                            <Pagination
                                currentPage={favoritesPage}
                                totalItems={favoriteProducts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setFavoritesPage}
                            />
                        </>
                    ) : (
                        <div className="empty-favorites">
                            <div className="empty-favorites-icon">❤️</div>
                            <h3>{language === 'ru' ? 'Здесь пока пусто...' : 'Bu yer hozircha bo\'sh...'}</h3>
                            <p>{language === 'ru' ? 'У вас пока нет избранных товаров. Добавьте то, что вам понравилось!' : 'Sizda hozircha sevimlilar yo\'q. O\'zingizga yoqqan mahsulotlarni qo\'shing!'}</p>
                            <button className="go-shopping-btn" onClick={() => setView('home')}>
                                {language === 'ru' ? 'Перейти к покупкам' : 'Xarid qilishni boshlash'}
                            </button>
                        </div>
                    )}
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
                            onProductClick={(p) => {
                                if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                    setPendingProduct(p);
                                    setIsAuthDrawerOpen(true);
                                } else {
                                    setSelectedProduct(p);
                                }
                            }}
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
                unreadCount={unreadCount}
            />

            <AuthDrawer
                isOpen={isAuthDrawerOpen}
                onClose={() => {
                    setIsAuthDrawerOpen(false);
                    setIsCheckingOut(false);
                    // Clear secondary flags
                    window._pendingLocationAfterAuth = false;
                }}
                language={language}
                user={currentUser}
                onAuthenticated={(user) => {
                    updateCurrentUser(user);
                    setIsAuthDrawerOpen(false); // Always close drawer first

                    if (isCheckingOut || window._pendingLocationAfterAuth) {
                        // Phone registered, now move to location step
                        setShowLocationPicker(true);
                        window._pendingLocationAfterAuth = false;
                    } else if (pendingProduct) {
                        setSelectedProduct(pendingProduct);
                        setPendingProduct(null);
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
                    <h1 className="brand-title">
                        <span className="humo">HUMO</span>
                        <span className="tezkor">TEZKOR</span>
                    </h1>
                    <button className="chat-btn" onClick={() => {
                        if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                            setIsAuthDrawerOpen(true);
                        } else {
                            setView('chat');
                        }
                    }}>
                        <span className="chat-icon">💬</span>
                    </button>
                </div>
                <p className="subtitle">{language === 'ru' ? 'минии приложение' : 'mini ilova'}</p>
            </header>

            <div className="search-container">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={language === 'ru' ? 'Поиск товаров...' : 'Mahsulotlarni qidirish...'}
                    onSearch={() => { }}
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

            {showSuccessModal && (
                <SuccessModal
                    language={language}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </div>
    );
};

export default Shop;
