import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, language, onLanguageChange, onItemClick, user }) => {
    const menuItems = [
        { id: 'profile', icon: '👤', label: language === 'ru' ? 'Личные данные' : "Shaxsiy ma'lumotlarim" },
        { id: 'orders', icon: '📋', label: language === 'ru' ? 'Мои заказы' : 'Buyurtmalarim' },
        { id: 'favorites', icon: '❤️', label: language === 'ru' ? 'Izbrannoe' : 'Sevimliklar' },
        { id: 'addresses', icon: '📍', label: language === 'ru' ? 'Moi adresa' : 'Manzillarim' },
        { id: 'notifications', icon: '🔔', label: language === 'ru' ? 'Uvedomleniya' : 'Bildirishmalar' },
        { id: 'about', icon: 'ℹ️', label: language === 'ru' ? 'O nas' : 'Biz haqimizda' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-logo-container">
                            <img src="/logo.png" alt="Humo Tezkor" className="sidebar-logo-img" />
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div key={item.id} className="sidebar-item" onClick={() => {
                            onItemClick(item.id);
                            onClose();
                        }}>
                            <span className="item-icon">{item.icon}</span>
                            <span className="item-label">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="language-selector">
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="lang-select"
                        >
                            <option value="uz">🇺🇿 O'zbekcha</option>
                            <option value="ru">🇷🇺 Русский</option>
                        </select>
                    </div>

                    <div className="contact-info">
                        <div className="contact-icon">🎧</div>
                        <div className="contact-details">
                            <span className="contact-label">{language === 'ru' ? 'Dlya svyazi' : 'Aloqa uchun'}</span>
                            <span className="contact-phone">+998933373493</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
