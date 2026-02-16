import React, { useState } from 'react';
import { getImageUrl, api } from '../api';
import LocationPicker from './LocationPicker';
import MapPicker from './MapPicker';
import './ProductDetail.css';

const ProductDetail = ({ product, language, onBack, favorites = [], onToggleFavorite }) => {
    const [quantity, setQuantity] = useState(1);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFavorite = favorites.includes(product.id);
    const webApp = window.Telegram?.WebApp;

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleAutoLocation = () => {
        if (webApp && webApp.requestLocation) {
            webApp.requestLocation((data) => {
                if (data && data.location) {
                    submitOrder({
                        latitude: data.location.latitude,
                        longitude: data.location.longitude,
                        delivery_address: 'Telegram Geolocation'
                    });
                }
            });
        } else {
            // Fallback for browser testing
            navigator.geolocation.getCurrentPosition((pos) => {
                submitOrder({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    delivery_address: 'Browser Geolocation'
                });
            }, () => {
                alert(language === 'ru' ? 'Не удалось получить доступ к геопозиции' : 'Joylashuvni aniqlab bo\'lmadi');
            });
        }
    };

    const submitOrder = async (locationData) => {
        setIsSubmitting(true);
        try {
            const userData = JSON.parse(localStorage.getItem('punyo_user'));
            const orderData = {
                telegram_user_id: userData?.telegram_user_id,
                items: [{ product_id: product.id, quantity }],
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                delivery_address: locationData.address || locationData.delivery_address,
                phone_number: userData?.phone_number
            };

            const response = await api.createOrder(orderData);
            if (response.id) {
                // Success animation and redirect handled by Shop or local state
                alert(language === 'ru' ? 'Заказ оформлен!' : 'Mahsulot savatga qo\'shildi va buyurtma berildi!');
                onBack(); // Go back home
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('Xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
            setShowLocationPicker(false);
            setShowMapPicker(false);
        }
    };

    return (
        <div className="product-detail-view">
            <div className="detail-header">
                <div className="detail-image-container">
                    <button className="detail-back-btn" onClick={onBack}>
                        <span className="arrow">←</span>
                    </button>
                    <button
                        className={`detail-favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={() => onToggleFavorite(product.id)}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                    {product.image ? (
                        <img src={getImageUrl(product.image)} alt={product.name} />
                    ) : (
                        <div className="placeholder-image">🖼️</div>
                    )}
                </div>
            </div>

            <div className="detail-info">
                <div className="detail-price-section">
                    <span className="detail-price">{product.price.toLocaleString()} UZS</span>
                </div>
                <h1 className="detail-name">
                    {language === 'ru' ? (product.name_ru || product.name) : product.name}
                </h1>
                {product.description && (
                    <p className="detail-description">
                        {language === 'ru' ? (product.description_ru || product.description) : product.description}
                    </p>
                )}
            </div>

            <div className="detail-actions-fixed">
                <div className="quantity-selector">
                    <button className="qty-btn minus" onClick={handleDecrement}>−</button>
                    <span className="qty-value">{quantity}</span>
                    <button className="qty-btn plus" onClick={handleIncrement}>+</button>
                </div>
                <button
                    className="add-to-cart-btn"
                    onClick={() => setShowLocationPicker(true)}
                    disabled={isSubmitting}
                >
                    <span className="cart-icon">🛒</span>
                    {isSubmitting
                        ? (language === 'ru' ? 'Оформление...' : 'Yuborilmoqda...')
                        : (language === 'ru' ? 'В корзиnu' : 'Savatga')}
                </button>
            </div>

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
                    onConfirm={(data) => submitOrder(data)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
