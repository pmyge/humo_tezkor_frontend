import React, { useState } from 'react';
import { getImageUrl } from '../api';
import './ProductDetail.css';

const ProductDetail = ({ product, language, onBack, favorites = [], onToggleFavorite, onAddToCart, selectedLocation, onShowLocationPicker }) => {
    const [quantity, setQuantity] = useState(1);

    const isFavorite = favorites.includes(product.id);

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleAddToCartClick = () => {
        onAddToCart(product, quantity);
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
                    {product.image_base64 || product.image ? (
                        <img src={product.image_base64 || getImageUrl(product.image)} alt={product.name} />
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

            <div className="location-selection-container">
                <div className="location-card" onClick={onShowLocationPicker}>
                    <div className="loc-icon-box">
                        <span className="loc-pin">📍</span>
                    </div>
                    <div className="loc-content">
                        <span className="loc-tag">{language === 'ru' ? 'АДРЕС ДОСТАВКИ' : 'YETKAZIB BERISH MANZILI'}</span>
                        <span className="loc-text">
                            {selectedLocation ? selectedLocation.address : (language === 'ru' ? 'Нажмите, чтобы указать адрес' : 'Manzilni ko\'rsatish uchun bosing')}
                        </span>
                    </div>
                    <div className="loc-arrow">
                        {selectedLocation ? '➔' : '+'}
                    </div>
                </div>
            </div>

            <div className="detail-actions-fixed">
                <div className="quantity-selector">
                    <button className="qty-btn minus" onClick={handleDecrement}>−</button>
                    <span className="qty-value">{quantity}</span>
                    <button className="qty-btn plus" onClick={handleIncrement}>+</button>
                </div>
                <button
                    className={`add-to-cart-btn ${!selectedLocation?.address ? 'disabled' : ''}`}
                    onClick={handleAddToCartClick}
                    disabled={!selectedLocation?.address}
                >
                    <span className="cart-icon">🛒</span>
                    {language === 'ru' ? 'В корзину' : 'Savatga'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
