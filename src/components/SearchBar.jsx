import React from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange }) {
    return (
        <div className="search-container">
            <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    placeholder="Mahsulotlarni qidirish"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="search-input"
                />
            </div>
        </div>
    );
}
