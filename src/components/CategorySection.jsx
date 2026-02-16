import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../api';
import './CategorySection.css';

export default function CategorySection({ category, onSelectCategory, language, favorites = [], onToggleFavorite, onProductClick }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await api.getCategoryProducts(category.id);
                setProducts(data.slice(0, 15));
                setLoading(false);
            } catch (error) {
                console.error('Error loading products for category:', category.id, error);
                setLoading(false);
            }
        };
        loadProducts();
    }, [category.id]);

    if (loading || products.length === 0) return null;

    return (
        <div className="category-section">
            <div className="section-header">
                <h2 className="section-title">
                    {language === 'ru' ? (category.name_ru || category.name) : category.name}
                </h2>
                <button className="see-all-btn" onClick={() => onSelectCategory(category)}>
                    {language === 'ru' ? 'Ещё' : 'Batafsil'} <span className="arrow">→</span>
                </button>
            </div>

            <div className="horizontal-product-scroll">
                {products.map(product => {
                    const isFavorite = favorites.includes(product.id);
                    return (
                        <div key={product.id} className="horizontal-product-card" onClick={() => onProductClick && onProductClick(product)}>
                            <div className="product-image">
                                <button
                                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(product.id);
                                    }}
                                >
                                    {isFavorite ? '❤️' : '🤍'}
                                </button>
                                {product.image ? (
                                    <img src={getImageUrl(product.image)} alt={product.name} />
                                ) : (
                                    <div className="placeholder-image">🖼️</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">
                                    {language === 'ru' ? (product.name_ru || product.name) : product.name}
                                </h3>
                                <p className="product-price">{product.price.toLocaleString()} UZS</p>
                            </div>
                        </div>
                    );
                })}

                {products.length >= 15 && (
                    <div className="view-more-card" onClick={() => onSelectCategory(category)}>
                        <div className="more-icon-circle">→</div>
                        <span>{language === 'ru' ? 'Все' : 'Hammasi'}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
