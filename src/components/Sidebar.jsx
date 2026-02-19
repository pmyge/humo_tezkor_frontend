import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, language, onLanguageChange, onItemClick, user, unreadCount = 0 }) => {
    const [phoneNumber, setPhoneNumber] = useState('+998933373493');

    useEffect(() => {
        api.getAbout().then(data => {
            if (data?.phone_number) setPhoneNumber(data.phone_number);
        }).catch(() => { });
    }, []);

    const menuItems = [
        {
            id: 'profile',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            ),
            label: language === 'ru' ? 'Личные данные' : "Shaxsiy ma'lumotlarim"
        },
        {
            id: 'orders',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
            ),
            label: language === 'ru' ? 'Мои заказы' : 'Buyurtmalarim'
        },
        {
            id: 'favorites',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            ),
            label: language === 'ru' ? 'Избранное' : 'Sevimlilar'
        },
        {
            id: 'notifications',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            ),
            label: language === 'ru' ? 'Уведомления' : 'Bildirishnomalar'
        },
        {
            id: 'about',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            ),
            label: language === 'ru' ? 'О нас' : 'Biz haqimizda'
        },
    ];

    const [isLangOpen, setIsLangOpen] = useState(false);

    const languages = [
        { code: 'uz', label: "🇺🇿 O'zbekcha" },
        { code: 'ru', label: "🇷🇺 Русский" }
    ];

    const activeLanguage = languages.find(l => l.code === language) || languages[0];

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
                            <span className="item-label">
                                {item.label}
                                {item.id === 'notifications' && unreadCount > 0 && (
                                    <span className="unread-dot-sidebar"></span>
                                )}
                            </span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className={`language-selector-collapsible ${isLangOpen ? 'expanded' : ''}`}>
                        <div
                            className="selected-language"
                            onClick={() => setIsLangOpen(!isLangOpen)}
                        >
                            <span className="lang-text">{activeLanguage.label}</span>
                            <svg
                                className={`chevron-icon ${isLangOpen ? 'up' : 'down'}`}
                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        <div className="language-options">
                            {languages.map((l) => (
                                <div
                                    key={l.code}
                                    className={`lang-option ${language === l.code ? 'active' : ''}`}
                                    onClick={() => {
                                        onLanguageChange(l.code);
                                        setIsLangOpen(false);
                                    }}
                                >
                                    <span className="lang-check">{language === l.code ? '✓' : ''}</span>
                                    <span className="lang-text">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="contact-info">
                        <div className="contact-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                            </svg>
                        </div>
                        <div className="contact-details">
                            <span className="contact-label">{language === 'ru' ? 'Для связи' : 'Aloqa uchun'}</span>
                            <span className="contact-phone">{phoneNumber}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
