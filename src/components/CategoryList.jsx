import { getImageUrl } from '../api';

export default function CategoryList({ categories, selectedCategory, onSelectCategory, language }) {
    return (
        <div className="category-list-container">
            <div className="category-list">
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
                        <span>{language === 'ru' ? (category.name_ru || category.name) : category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
