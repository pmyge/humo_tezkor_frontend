import React from 'react';
import './CategoryList.css';

export default function CategoryList({ categories, selectedCategory, onSelectCategory }) {
    return (
        <div className="category-list-container">
            <div className="category-list">
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="category-icon">
                            <img src={category.image} alt={category.name} />
                        </div>
                        <span className="category-name">{category.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
