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
    const telegram = window.Telegram?.WebApp;

    useEffect(() => {
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
                                <Shop language={language} />
                            </RouteGuard>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <RouteGuard>
                                <Shop language={language} />
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
