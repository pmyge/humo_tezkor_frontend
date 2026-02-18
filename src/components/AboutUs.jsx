import React from 'react';
import './AboutUs.css';

export default function AboutUs({ about, language, onBack }) {
    const handleMapClick = () => {
        if (!about?.address) return;
        const encodedAddress = encodeURIComponent(about.address);
        const yandexMapsUrl = `https://yandex.uz/maps/?text=${encodedAddress}`;
        window.open(yandexMapsUrl, '_blank');
    };

    return (
        <div className="au-wrapper">
            {/* Nav Header */}
            <header className="au-header">
                <button className="au-back-circle" onClick={onBack}>
                    <span className="au-back-arrow">←</span>
                </button>
                <div className="au-header-text">
                    <h1>{language === 'ru' ? 'O NAS' : 'BIZ HAQIMIZDA'}</h1>
                    <p>{language === 'ru' ? 'Informatsiya o magazine' : 'Do\'kon haqida ma\'lumot'}</p>
                </div>
            </header>

            <div className="au-scroll-area">
                {!about ? (
                    <div className="au-loader-center">
                        <div className="au-spinner"></div>
                        <p>{language === 'ru' ? 'Zagruzka...' : 'Yuklanmoqda...'}</p>
                    </div>
                ) : (
                    <div className="au-content-stack">
                        {/* Shop Brand Card */}
                        <div className="au-brand-card">
                            <h2 className="au-shop-title">HUMO TEZKOR</h2>
                            <p className="au-shop-desc">
                                {language === 'ru'
                                    ? 'Vash nadyojniy partner v mire pokupok'
                                    : 'Xaridlar olamidagi ishonchli hamkoringiz'}
                            </p>
                        </div>

                        {/* Contact Cards */}
                        <div className="au-info-grid">
                            <div className="au-card-item">
                                <div className="au-icon-box">📞</div>
                                <div className="au-card-body">
                                    <span className="au-label">{language === 'ru' ? 'Telefon' : 'Telefon'}</span>
                                    <a href={`tel:${about.phone_number}`} className="au-value">{about.phone_number}</a>
                                </div>
                            </div>

                            <div className="au-card-item">
                                <div className="au-icon-box">✉️</div>
                                <div className="au-card-body">
                                    <span className="au-label">{language === 'ru' ? 'Email' : 'Email'}</span>
                                    <a href={`mailto:${about.email}`} className="au-value">{about.email}</a>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="au-location-card">
                            <div className="au-card-item no-border">
                                <div className="au-icon-box orange">📍</div>
                                <div className="au-card-body">
                                    <span className="au-label">{language === 'ru' ? 'Nash Adres' : 'Bizning Manzil'}</span>
                                    <p className="au-value-text">{about.address}</p>
                                </div>
                            </div>

                            <div className="au-map-container" onClick={handleMapClick}>
                                <img
                                    src="https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=67.971253,40.525546&z=14&l=map&size=600,300&pt=67.971253,40.525546,pm2rdm"
                                    alt="Map"
                                    className="au-map-static"
                                />
                                <div className="au-map-overlay">
                                    <div className="au-map-btn">
                                        <span>{language === 'ru' ? 'Otkrit v Navigatore' : 'Navigatorda ochish'}</span>
                                        <span className="au-btn-icon">🗺️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <footer className="au-page-footer">
                            <div className="au-footer-divider"></div>
                            <p className="au-copyright">© 2024 HUMO TEZKOR MINI ILOVA</p>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
}
