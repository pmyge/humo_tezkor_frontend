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
            const urlParams = new URLSearchParams(window.location.search);
            const tidParam = urlParams.get('tid');
            let userId = tidParam && parseInt(tidParam) > 0 ? parseInt(tidParam) : telegram?.initDataUnsafe?.user?.id;

            // Fallback to manual parse if telegram object is not ready
            if (!userId) {
                try {
                    const hashParams = new URLSearchParams(window.location.hash.slice(1));
                    const tgWebAppData = hashParams.get('tgWebAppData');
                    const source = tgWebAppData ? new URLSearchParams(tgWebAppData) : hashParams;
                    const userRaw = source.get('user');
                    if (userRaw) userId = JSON.parse(userRaw).id;
                } catch (e) { }
            }

            if (userId) {
                try {
                    const userInfo = await api.getUserInfo(userId);
                    // If user not found or no phone, we no longer force redirect to registration
                    // Registration will be prompted via AuthDrawer for specific actions
                    /*
                    if ((!userInfo || !userInfo.phone_number || userInfo.phone_number === '-') && location.pathname !== '/registration') {
                        const redirectPath = encodeURIComponent(location.pathname + location.search);
                        navigate(`/registration?redirect=${redirectPath}`);
                    }
                    */
                    if (userInfo?.language) {
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
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
    const [language, setLanguage] = React.useState('uz');
    const telegram = window.Telegram?.WebApp;

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (telegram) {
            telegram.ready();
            telegram.expand();
            telegram.MainButton.hide();

            // Fetch user language
            const fetchLang = async () => {
                const urlParams = new URLSearchParams(window.location.search);
                const tidParam = urlParams.get('tid');
                let userId = tidParam && parseInt(tidParam) > 0 ? parseInt(tidParam) : telegram.initDataUnsafe?.user?.id;

                if (!userId) {
                    try {
                        const hashParams = new URLSearchParams(window.location.hash.slice(1));
                        const tgWebAppData = hashParams.get('tgWebAppData');
                        const source = tgWebAppData ? new URLSearchParams(tgWebAppData) : hashParams;
                        const userRaw = source.get('user');
                        if (userRaw) userId = JSON.parse(userRaw).id;
                    } catch (e) { }
                }

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

    return (
        <Router>
            <div className="app" data-theme={theme}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <RouteGuard>
                                <Shop language={language} theme={theme} toggleTheme={toggleTheme} />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <RouteGuard>
                                <Shop language={language} theme={theme} toggleTheme={toggleTheme} />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <RouteGuard>
                                <Shop language={language} theme={theme} toggleTheme={toggleTheme} />
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
