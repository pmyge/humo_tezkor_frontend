import { getImageUrl } from '../api';

export default function CategoryList({ categories, selectedCategory, onSelectCategory }) {
    return (
        <div className="category-list-container">
            <div className="category-list">
                {/* "All" Category if needed or just categories from API */}
                {categories.map(category => (
                    <div
                        key={category.id}
                        className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="category-image-container">
                            {category.image ? (
                                <img src={getImageUrl(category.image)} alt={category.name} />
                            ) : (
                                <span className="category-icon">📦</span>
                            )}
                        </div>
                        <span>{category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
