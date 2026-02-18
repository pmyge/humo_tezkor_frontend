import React from 'react';
import './AboutUs.css';

export default function AboutUs({ about, language, onBack }) {
    const handleMapClick = () => {
        if (!about?.address) return;
        // Yandex Maps URL with search query
        const encodedAddress = encodeURIComponent(about.address);
        const yandexMapsUrl = `https://yandex.uz/maps/?text=${encodedAddress}`;
        window.open(yandexMapsUrl, '_blank');
    };

    return (
        <div className="about-us-view">
            <div className="view-header">
                <button className="back-btn" onClick={onBack}>←</button>
                <h2 className="view-title">
                    {language === 'ru' ? 'O NAS' : 'BIZ HAQIMIZDA'}
                </h2>
            </div>

            {!about ? (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>{language === 'ru' ? 'Zagruzka...' : 'Yuklanmoqda...'}</p>
                </div>
            ) : (
                <div className="about-content">
                    <div className="shop-logo-container">
                        <img src="logo.png" alt="Shop Logo" className="shop-logo" />
                    </div>

                    <div className="info-card">
                        <div className="info-item">
                            <span className="info-icon">📞</span>
                            <div className="info-details">
                                <span className="info-label">{language === 'ru' ? 'Telefon' : 'Telefon raqami'}</span>
                                <a href={`tel:${about.phone_number}`} className="info-value">{about.phone_number}</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="info-icon">✉️</span>
                            <div className="info-details">
                                <span className="info-label">{language === 'ru' ? 'Email' : 'Email manzili'}</span>
                                <a href={`mailto:${about.email}`} className="info-value">{about.email}</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <span className="info-icon">📍</span>
                            <div className="info-details">
                                <span className="info-label">{language === 'ru' ? 'Adres' : 'Manzil'}</span>
                                <span className="info-value">{about.address}</span>
                            </div>
                        </div>
                    </div>

                    <div className="map-section" onClick={handleMapClick}>
                        <p className="map-hint">
                            {language === 'ru' ? 'Najmite, chtobi otkrit v Yandex Kartax' : 'Yandex Xaritada ko\'rish uchun bosing'}
                        </p>
                        <div className="map-image-container">
                            <img
                                src="https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=67.971253,40.525546&z=14&l=map&size=600,300&pt=67.971253,40.525546,pm2rdm"
                                alt="Shop Location Map"
                                className="map-image"
                            />
                            <div className="map-overlay">
                                <span className="overlay-icon">🗺️</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
