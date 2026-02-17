import React, { useState } from 'react';
import { api } from '../api';
import { countries } from '../countries';
import './AuthDrawer.css';

export default function AuthDrawer({ isOpen, onClose, onAuthenticated, language, user }) {
    const [userName, setUserName] = useState(user?.first_name || '');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: Uzbekistan
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const telegram = window.Telegram?.WebApp;

    // ... (keep extractUserId as is)

    const handleContinue = async () => {
        if (!userName.trim()) {
            setError(language === 'ru' ? 'Введите ваше имя' : 'Ismingizni kiriting');
            return;
        }
        if (phoneNumber.length < 5) {
            setError(language === 'ru' ? 'Слишком короткий номер' : 'Nomer juda qisqa');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userId = extractUserId();
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

            console.log('DEBUG AuthDrawer: Registration attempt:', { userId, userName, phone: phoneNumber });

            const fullPhone = selectedCountry.code + phoneNumber;

            // Register/Update user with both name and phone
            const response = await api.registerPhone(
                userId || 0,
                fullPhone,
                userName, // Use entered name
                '',       // last_name empty by default
                tgUser?.username || userName.toLowerCase().replace(/\s+/g, '_') // fallback username
            );

            if (response) {
                console.log('DEBUG AuthDrawer: registration success:', response);
                onAuthenticated(response);
                onClose();
            }
        } catch (err) {
            console.error('Registration error:', err);
            const msg = err.message || (language === 'ru' ? 'Произошла ошибка' : 'Xatolik yuz berdi');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}></div>
            <div className="auth-drawer">
                <div className="drawer-handle"></div>
                <div className="drawer-header">
                    <button className="drawer-back" onClick={onClose}>
                        <span className="arrow">←</span> {language === 'ru' ? 'Назад' : 'Orqaga'}
                    </button>
                </div>

                <div className="drawer-content">
                    <h2 className="drawer-title">
                        {language === 'ru' ? 'Личные данные' : "Shaxsiy ma'lumotlar"}
                    </h2>
                    <p className="drawer-subtitle">
                        {language === 'ru' ? 'Введите имя и номер телефона' : 'Ismingiz va telefon raqamingizni kiriting'}
                    </p>

                    <div className="input-group-label">{language === 'ru' ? 'Ваше имя' : 'Ismingiz'}</div>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={language === 'ru' ? 'Имя' : 'Ism'}
                        className={`name-field ${error && !userName ? 'has-error' : ''}`}
                    />

                    <div className="input-group-label">{language === 'ru' ? 'Номер телефона' : 'Telefon raqamingiz'}</div>
                    <div className={`phone-input-group ${error && !phoneNumber ? 'has-error' : ''}`}>
                        <div className="country-selector-container">
                            <select
                                className="country-dropdown"
                                onChange={(e) => {
                                    const country = countries.find(c => c.code === e.target.value);
                                    if (country) setSelectedCountry(country);
                                }}
                                value={selectedCountry.code}
                            >
                                {countries.map((c, i) => (
                                    <option key={`${c.iso}-${i}`} value={c.code}>
                                        {c.flag} {c.code} ({c.name})
                                    </option>
                                ))}
                            </select>
                            <div className="selected-country-view">
                                <span>{selectedCountry.flag}</span>
                                <span className="code-text">{selectedCountry.code}</span>
                                <span className="dropdown-arrow">▼</span>
                            </div>
                        </div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="00 000 00 00"
                            className="phone-field"
                        />
                    </div>
                    {error && <p className="drawer-error-text">{error}</p>}

                    <p className="drawer-privacy">
                        {language === 'ru'
                            ? 'Нажимая кнопку Продолжить, вы соглашаетесь с нашей Политикой конфиденциальности.'
                            : 'Davom etish tugmasini bosish orqali siz bizning MAXFIYLIK SIYOSATIMIZga rozilik bildirasiz.'}
                    </p>

                    <button
                        className="drawer-continue-btn"
                        onClick={handleContinue}
                        disabled={loading || phoneNumber.length < 5 || !userName.trim()}
                    >
                        {loading
                            ? (language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...')
                            : (language === 'ru' ? 'Продолжить' : 'Davom etish')}
                    </button>
                </div>
            </div>
        </>
    );
}
