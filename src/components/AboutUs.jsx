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
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-shape-1"></div>
                    <div className="hero-shape-2"></div>
                    <div className="logo-wrapper">
                        <img src="logo.png" alt="Shop Logo" className="hero-logo" />
                    </div>
                    <h2 className="hero-shop-name">HUMO TEZKOR</h2>
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

                        {/* Location Card */}
                        <div className="glass-card location-card">
                            <div className="card-icon-bg">📍</div>
                            <div className="card-body">
                                <label>{language === 'ru' ? 'Nash Adres' : 'Bizning Manzil'}</label>
                                <p>{about.address}</p>
                            </div>
                        </div>

                        {/* Interactive Map Section */}
                        <section className="map-wrapper" onClick={handleMapClick}>
                            <h3 className="section-label">
                                {language === 'ru' ? 'LOKATSIYA' : 'LOKATSIYA'}
                            </h3>
                            <div className="map-frame">
                                <img
                                    src="https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=67.971253,40.525546&z=14&l=map&size=600,300&pt=67.971253,40.525546,pm2rdm"
                                    alt="Location Map"
                                    className="map-img"
                                />
                                <div className="map-badges">
                                    <span className="badge-yandex">Yandex Maps</span>
                                </div>
                                <div className="map-pulse-container">
                                    <div className="map-pulse"></div>
                                    <span className="tap-hint">👆</span>
                                </div>
                            </div>
                            <p className="map-footer-hint">
                                {language === 'ru'
                                    ? 'Najmite, chtobi otkrit v navigator'
                                    : 'Navigatorda ochish uchun bosing'}
                            </p>
                        </section>

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
