import React, { useState } from 'react';
import { api } from '../api';
import './AuthDrawer.css';

export default function AuthDrawer({ isOpen, onClose, onAuthenticated, language }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const telegram = window.Telegram.WebApp;

    const handleContinue = async () => {
        if (phoneNumber.length < 3) {
            setError(language === 'ru' ? 'Слишком короткий номер' : 'Nomer juda qisqa');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = telegram.initDataUnsafe?.user;
            if (!user) {
                setError('Telegram user topilmadi');
                setLoading(false);
                return;
            }

            const response = await api.registerPhone(user.id, '+998' + phoneNumber);
            if (response) {
                onAuthenticated(response);
                onClose();
            }
        } catch (err) {
            setError(language === 'ru' ? 'Произошла ошибка' : 'Xatolik yuz berdi');
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
                        <div className="country-code">
                            <img src="https://flagcdn.com/w20/uz.png" alt="UZ" />
                            <span className="code-text">+998</span>
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="00 000 00 00"
                            className="phone-field"
                        />
                    </div>
                    {error && <p className="drawer-error-text">{error}</p>}

                    <p className="drawer-privacy">
                        {language === 'ru'
                            ? 'Нажимая кнопку Продолжить, вы соглашаетесь с нашей Политикой конфиденциальности политикой конфиденциальности.'
                            : 'Davom etish tugmasini bosish orqali siz bizning MAXFIYLIK SIYOSATIMIZga rozilik bildirasiz.'}
                    </p>

                    <button
                        className="drawer-continue-btn"
                        onClick={handleContinue}
                        disabled={loading || phoneNumber.length < 3}
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
