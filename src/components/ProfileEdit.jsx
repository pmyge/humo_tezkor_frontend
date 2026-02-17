import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './ProfileEdit.css';

export default function ProfileEdit({ user, onBack, onSave, language }) {
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [loading, setLoading] = useState(false);

    // Sync state if user prop changes
    useEffect(() => {
        if (user) {
            setPhoneNumber(user.phone_number || '');
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.id;
            const result = await api.updateUser(userId, {
                phone_number: phoneNumber
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
                    disabled={loading}
                >
                    {loading
                        ? (language === 'ru' ? 'Сохранение...' : 'Saqlanmoqda...')
                        : (language === 'ru' ? 'Saqlash' : 'Saqlash')}
                </button>
            </div>

            <div className="profile-footer">
                @PUNYOMARKET_BOT
            </div>
        </div>
    );
}
