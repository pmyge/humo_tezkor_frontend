import React, { useState } from 'react';
import { api } from '../api';
import { countries } from '../countries';
import './AuthDrawer.css';

export default function AuthDrawer({ isOpen, onClose, onAuthenticated, language }) {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: Uzbekistan
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const telegram = window.Telegram?.WebApp;

    const handleContinue = async () => {
        if (phoneNumber.length < 5) {
            setError(language === 'ru' ? 'Слишком короткий номер' : 'Nomer juda qisqa');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use telegram user ID if available, otherwise use a fallback for testing
            const tgUser = telegram?.initDataUnsafe?.user;
            const userId = tgUser?.id || 123456789; // Robust fallback ID for non-TG environments

            const fullPhone = selectedCountry.code + phoneNumber;
            const response = await api.registerPhone(
                userId,
                fullPhone,
                tgUser?.first_name || '',
                tgUser?.last_name || ''
            );

            if (response) {
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
