import { getImageUrl } from '../api';
import './CategoryList.css';

export default function CategoryList({ categories, selectedCategory, onSelectCategory, onShowAllCategories, language }) {
    const displayCategories = categories;
    const hasMore = false;

    return (
        <div className="category-list-container">
            <div className="category-list">
                {displayCategories.map(category => (
                    <div
                        key={category.id}
                        className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="category-image-container">
                            {category.image_base64 || category.image ? (
                                <img src={category.image_base64 || getImageUrl(category.image)} alt={category.name} />
                            ) : (
                                <span className="category-icon">📦</span>
                            )}
                        </div>
                        <span>{language === 'ru' ? (category.name_ru || category.name) : category.name}</span>
                    </div>
                ))}

                {hasMore && (
                    <div className="category-item more-button" onClick={onShowAllCategories}>
                        <div className="category-image-container more-icon">
                            <span className="category-icon">➕</span>
                        </div>
                        <span>{language === 'ru' ? 'Ещё' : 'Batafsil'}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
