import React from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onAutoLocation, onManualLocation, onCancel, language }) => {
    return (
        <div className="location-picker-overlay">
            <div className="location-picker-card">
                <button className="close-btn" onClick={onCancel}>×</button>
                <div className="location-icon-container">
                    <div className="location-pin">📍</div>
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
