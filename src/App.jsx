import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Shop from './components/Shop';
import Orders from './components/Orders';
import PhoneRegistration from './components/PhoneRegistration';
import { api } from './api';

const RouteGuard = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const telegram = window.Telegram?.WebApp;

    useEffect(() => {
        const checkUser = async () => {
            if (telegram?.initDataUnsafe?.user?.id) {
                const userId = telegram.initDataUnsafe.user.id;
                try {
                    const userInfo = await api.getUserInfo(userId);
                    // If user not found or no phone, and not already on registration page
                    if ((!userInfo || !userInfo.phone_number) && location.pathname !== '/registration') {
                        // Only navigate to registration if definitely missing phone and not already there
                        navigate('/registration');
                    }
                    if (userInfo?.language) {
                        // This helps sync if they changed it in the bot and re-opened
                        window.dispatchEvent(new CustomEvent('langChange', { detail: userInfo.language }));
                    }
                } catch (err) {
                    console.error('Auth check error:', err);
                }
            }
        };

        checkUser();
    }, [navigate, location.pathname, telegram]);

    return children;
};

function App() {
    const [language, setLanguage] = React.useState('uz');
    const [isTelegram, setIsTelegram] = React.useState(true);
    const telegram = window.Telegram?.WebApp;

    useEffect(() => {
        // Strict environment check: Must have initData and be inside Telegram WebApp
        // initData is only present when opened as a Telegram WebApp
        const isTgEnv = telegram?.initData && telegram?.platform !== 'unknown';

        // On localhost/127.0.0.1, we allow browser access for development
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (!isTgEnv && !isLocal) {
            setIsTelegram(false);
            return;
        }

        if (telegram) {
            telegram.ready();
            telegram.expand();
            telegram.MainButton.hide();

            // Fetch user language
            const fetchLang = async () => {
                const userId = telegram.initDataUnsafe?.user?.id;
                if (userId) {
                    const user = await api.getUserInfo(userId);
                    if (user?.language) {
                        setLanguage(user.language);
                    }
                }
            };
            fetchLang();
        }

        const handleLangChange = (e) => setLanguage(e.detail);
        window.addEventListener('langChange', handleLangChange);
        return () => window.removeEventListener('langChange', handleLangChange);
    }, [telegram]);

    if (!isTelegram) {
        return (
            <div className="telegram-only-error">
                <div className="error-content">
                    <div className="error-icon">🤖</div>
                    <h1>{language === 'uz' ? 'Ilova faqat Telegram ichida ishlaydi' : 'Приложение работает только внутри Telegram'}</h1>
                    <p>
                        {language === 'uz'
                            ? 'Iltimos, do\'konga kirish uchun @punyo_market_bot botidan foydalaning.'
                            : 'Пожалуйста, используйте бот @punyo_market_bot для доступа к магазину.'}
                    </p>
                    <a href="https://t.me/punyo_market_bot" className="open-bot-btn">
                        {language === 'uz' ? 'Botni ochish' : 'Открыть бот'}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <RouteGuard>
                                <Shop language={language} />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <RouteGuard>
                                <Orders />
                            </RouteGuard>
                        }
                    />
                    <Route path="/registration" element={<PhoneRegistration />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
