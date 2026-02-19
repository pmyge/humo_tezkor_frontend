import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './PhoneRegistration.css';

const PhoneRegistration = () => {
    const [phoneNumber, setPhoneNumber] = useState('+998');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const telegram = window.Telegram.WebApp;

    useEffect(() => {
        telegram.ready();
        telegram.expand();
    }, []);

    const handleContinue = async () => {
        if (phoneNumber.replace('+998', '').length < 3) {
            setError('Nomer juda qisqa');
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

            const response = await api.registerPhone(
                user.id,
                phoneNumber,
                user.first_name || '',
                user.last_name || '',
                user.username || ''
            );
            if (response) {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');

                if (redirect) {
                    navigate(decodeURIComponent(redirect));
                } else {
                    const tid = user.id;
                    navigate(`/?tid=${tid}`);
                }
            }
        } catch (err) {
            setError('Xatolik yuz berdi. Qayta urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="reg-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-chevron-left"></i> Nazad
                </button>
            </div>

            <div className="reg-content">
                <h2>Введите свой номер телефона</h2>

                <div className="input-group">
                    <div className="country-code">
                        <img src="https://flagcdn.com/w20/uz.png" alt="UZ" />
                        <span>+998</span>
                    </div>
                    <input
                        type="tel"
                        value={phoneNumber.replace('+998', '')}
                        onChange={(e) => setPhoneNumber('+998' + e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="00 000 00 00"
                        className={error ? 'input-error' : ''}
                    />
                </div>
                {error && <p className="error-text">{error}</p>}

                <p className="privacy-text">
                    Нажимая кнопку Продолжить, вы соглашаетесь с нашей
                    <a href="#"> Политикой конфиденциальности</a> политикой конфиденциальности.
                </p>

                <button
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={loading}
                >
                    {loading ? 'Yuborilmoqda...' : 'Продолжить'}
                </button>
            </div>

            <div className="reg-footer">
                @HUMOMARKET_BOT
            </div>
        </div>
    );
};

export default PhoneRegistration;
