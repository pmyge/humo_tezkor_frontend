import React from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onAutoLocation, onManualLocation, onCancel, language }) => {
    return (
        <div className="location-picker-overlay">
            <div className="location-picker-card">
                <button className="close-btn" onClick={onCancel}>×</button>
                <div className="location-icon-container">
                    <div className="location-pin">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <circle cx="12" cy="9" r="3" fill="white" />
                        </svg>
                    </div>
                    <div className="location-pulse"></div>
                </div>

                <h2 className="location-title">
                    {language === 'ru' ? 'Где вы находитесь?' : 'Sotib olgan mahsulotingizni qayerga yetkazib berish kerak? 🚚'}
                </h2>
                <p className="location-subtitle">
                    {language === 'ru'
                        ? 'Отправьте свое местоположение, и мы быстро доставим ваш заказ!'
                        : 'Joylashuvigizni yuboring, biz eng yaqin do‘kon yoki omborni aniqlaymiz va buyurtmangizni tezkor yetkazib beramiz!'}
                </p>

                <div className="location-actions">
                    <button className="btn-primary" onClick={onManualLocation}>
                        {language === 'ru' ? 'Указать на карте' : 'Joylashuvni belgilash'}
                    </button>
                </div>

                <div className="location-footer">
                    @HUMO_TEZKOR_BOT
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
