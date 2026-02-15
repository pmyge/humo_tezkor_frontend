import React from 'react';
import './ProductGrid.css';

export default function ProductGrid({ products }) {
    if (products.length === 0) {
        return <div className="no-products">Mahsulotlar topilmadi</div>;
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <div className="product-image">
                        <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">{product.price.toLocaleString()} UZS</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
