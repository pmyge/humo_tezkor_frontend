export default function AboutUs({ about, language, onBack }) {
    const handleMapClick = () => {
        if (!about?.address) return;
        const encodedAddress = encodeURIComponent(about.address);
        const yandexMapsUrl = `https://yandex.uz/maps/?text=${encodedAddress}`;
        window.open(yandexMapsUrl, '_blank');
    };

    return (
        <div className="about-us-container">
            {/* Glassmorphism Header */}
            <header className="about-header">
                <button className="back-btn" onClick={onBack}>
                    <span className="back-icon">←</span>
                </button>
                <h1 className="header-title">
                    {language === 'ru' ? 'O NAS' : 'BIZ HAQIMIZDA'}
                </h1>
            </header>

            <div className="about-scroll-view">
                {/* Hero Section - No Logo */}
                <section className="about-hero-minimal">
                    <h2 className="hero-shop-name">HUMO TEZKOR</h2>
                    <div className="hero-divider"></div>
                    <p className="hero-tagline">
                        {language === 'ru'
                            ? 'Vash nadyojniy partner v mire pokupok'
                            : 'Xaridlar olamidagi ishonchli hamkoringiz'}
                    </p>
                </section>

                {!about ? (
                    <div className="about-loading">
                        <div className="premium-loader"></div>
                        <p>{language === 'ru' ? 'Sinxronizatsiya...' : 'Sinxronizatsiya qilinmoqda...'}</p>
                    </div>
                ) : (
                    <div className="about-main-content">
                        {/* Info Cards Grid */}
                        <div className="info-grid">
                            <div className="glass-card contact-card">
                                <div className="card-icon-bg">📞</div>
                                <div className="card-body">
                                    <label>{language === 'ru' ? 'Telefon' : 'Telefon'}</label>
                                    <a href={`tel:${about.phone_number}`}>{about.phone_number}</a>
                                </div>
                            </div>

                            <div className="glass-card email-card">
                                <div className="card-icon-bg">✉️</div>
                                <div className="card-body">
                                    <label>{language === 'ru' ? 'Email' : 'Email'}</label>
                                    <a href={`mailto:${about.email}`}>{about.email}</a>
                                </div>
                            </div>
                        </div>

                        {/* Custom Location Section */}
                        <div className="location-section-premium">
                            <div className="location-header">
                                <div className="loc-icon-wrapper">📍</div>
                                <div className="loc-text">
                                    <label>{language === 'ru' ? 'Nash Adres' : 'Bizning Manzil'}</label>
                                    <p>{about.address}</p>
                                </div>
                            </div>

                            <div className="map-interaction-area" onClick={handleMapClick}>
                                <div className="map-frame-refined">
                                    <img
                                        src="https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=67.971253,40.525546&z=14&l=map&size=600,300&pt=67.971253,40.525546,pm2rdm"
                                        alt="Location Map"
                                        className="map-img-refined"
                                    />
                                    <div className="map-overlay-v2">
                                        <div className="map-button-premium">
                                            <span className="btn-icon">🗺️</span>
                                            <span>{language === 'ru' ? 'Otkrit v Yandex Kartax' : 'Yandex Xaritada ochish'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Logo/Name */}
                        <footer className="about-footer">
                            <div className="footer-line"></div>
                            <span className="footer-copyright">© 2024 HUMO TEZKOR</span>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
}
