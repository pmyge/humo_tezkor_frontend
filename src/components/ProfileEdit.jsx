import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './ProfileEdit.css';

export default function ProfileEdit({ user, onBack, onSave, language }) {
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [userName, setUserName] = useState(user?.first_name || '');
    const [loading, setLoading] = useState(false);

    // Sync state if user prop changes
    useEffect(() => {
        if (user) {
            setPhoneNumber(user.phone_number || '');
            setUserName(user.first_name || '');
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.id;
            const result = await api.updateUser(userId, {
                phone_number: phoneNumber,
                first_name: userName
            });
            if (result) {
                onSave(result);
                alert(language === 'ru' ? 'Изменения сохранены!' : 'O\'zgarishlar saqlandi!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-edit-view">
            <div className="category-title">
                <span className="back-btn" onClick={onBack}>←</span>
                {language === 'ru' ? 'Мои персональные данные' : 'Mening shaxsiy ma\'lumotlarim'}
            </div>

            <div className="profile-form">
                <div className="profile-input-group">
                    <label className="input-label">
                        {language === 'ru' ? 'Имя' : 'Ismingiz'}
                    </label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={language === 'ru' ? 'Имя' : 'Ism'}
                        className="profile-input"
                    />
                </div>

                <div className="profile-input-group">
                    <label className="input-label">
                        {language === 'ru' ? 'Номер телефона' : 'Telefon raqami'}
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+998 00 000 00 00"
                        className="profile-input"
                    />
                </div>

                <button
                    className="save-changes-btn"
                    onClick={handleSave}
                    disabled={loading || !userName.trim() || !phoneNumber}
                >
                    {loading
                        ? (language === 'ru' ? 'Сохранение...' : 'Saqlanmoqda...')
                        : (language === 'ru' ? 'Сохранить' : 'Saqlash')}
                </button>

                <div className="logout-section">
                    <button
                        className="logout-btn"
                        onClick={async () => {
                            if (window.confirm(language === 'ru' ? 'Вы уверены, что хотите выйти? Ваши данные будут удалены.' : 'Tizimdan chiqmoqchimisiz? Ma\'lumotlaringiz o\'chiriladi.')) {
                                setLoading(true);
                                try {
                                    const userId = user.telegram_user_id || user.id;
                                    await api.deleteAccount(userId);
                                    localStorage.removeItem('punyo_user');
                                    onSave(null); // Reset user state in Shop
                                } catch (e) {
                                    console.error('Logout error:', e);
                                    alert('Error: ' + e.message);
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        disabled={loading}
                    >
                        {language === 'ru' ? 'Выйти из системы' : 'Tizimdan chiqish'}
                    </button>
                    <p className="logout-hint">
                        {language === 'ru'
                            ? 'Ваши данные будут удалены из базы данных.'
                            : 'Ma\'lumotlaringiz bazadan o\'chiriladi.'}
                    </p>
                </div>
            </div>

            <div className="profile-footer">
                @HUMO_TEZKOR_BOT
            </div>
        </div>
    );
}
