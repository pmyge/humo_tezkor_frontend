import React, { useState } from 'react';
import { api } from '../api';
import { countries } from '../countries';
import './AuthDrawer.css';

export default function AuthDrawer({ isOpen, onClose, onAuthenticated, language, user }) {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: Uzbekistan
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const telegram = window.Telegram?.WebApp;

    const extractUserId = () => {
        // Priority 1: Real Telegram WebApp User object
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser?.id) return tgUser.id;

        // Priority 2: Parse from raw initData string (backup for some clients)
        try {
            const rawData = window.Telegram?.WebApp?.initData;
            if (rawData) {
                const params = new URLSearchParams(rawData);
                const userRaw = params.get('user');
                if (userRaw) {
                    const userObj = JSON.parse(userRaw);
                    if (userObj?.id) return userObj.id;
                }
            }
        } catch (e) {
            console.warn('DEBUG AuthDrawer: Failed to parse initData string', e);
        }

        // Priority 3: Passed user prop from parent
        if (user?.telegram_user_id) return user.telegram_user_id;

        // Priority 4: Stored identity in localStorage
        const saved = localStorage.getItem('punyo_user');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed?.telegram_user_id && parsed.telegram_user_id < 9000000000) {
                    return parsed.telegram_user_id;
                }
            } catch (e) { }
        }

        return null;
    };

    const handleContinue = async () => {
        if (phoneNumber.length < 5) {
            setError(language === 'ru' ? 'Слишком короткий номер' : 'Nomer juda qisqa');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userId = extractUserId();
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

            console.log('DEBUG AuthDrawer: Final Identity Check:', { userId, tgUser });

            if (!userId) {
                const errorMsg = language === 'ru'
                    ? 'Ошибка идентификации. Пожалуйста, закройте и снова откройте приложение через бота.'
                    : 'Identifikatsiya xatoligi. Iltimos, ilovani yopib bot orqali boshqatdan oching.';
                setError(errorMsg);
                setLoading(false);
                return;
            }

            const firstName = tgUser?.first_name || user?.first_name || '';
            const lastName = tgUser?.last_name || user?.last_name || '';
            const fullPhone = selectedCountry.code + phoneNumber;

            const response = await api.registerPhone(
                userId,
                fullPhone,
                firstName,
                lastName,
                tgUser?.username || user?.username || ''
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
                        {language === 'ru' ? 'Введите свой номер телефона' : 'Telefon raqamingizni kiriting'}
                    </h2>

                    <div className={`phone-input-group ${error ? 'has-error' : ''}`}>
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
                        disabled={loading || phoneNumber.length < 5}
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
