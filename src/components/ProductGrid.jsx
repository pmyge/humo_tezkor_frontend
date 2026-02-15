import { getImageUrl } from '../api';

export default function ProductGrid({ products, language }) {
    if (products.length === 0) {
        return <div className="no-products">
            {language === 'ru' ? 'Товары не найдены' : 'Mahsulotlar topilmadi'}
        </div>;
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <div className="product-image">
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
            ))}
        </div>
    );
}
