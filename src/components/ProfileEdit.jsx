import React, { useState } from 'react';
import { api } from '../api';
import './ProfileEdit.css';

export default function ProfileEdit({ user, onBack, onSave, language }) {
    const [name, setName] = useState(user?.first_name || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.telegram_id;
            console.log('DEBUG ProfileEdit: saving for user', userId, 'with name', name);
            const result = await api.updateUser(userId, { first_name: name });
            console.log('DEBUG ProfileEdit: result received:', result);
            if (result) {
                onSave(result);
                // Also give immediate visual feedback
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
                        type="text"
                        value={user?.phone_number || ''}
                        disabled
                        className="profile-input disabled"
                    />
                </div>

                <div className="profile-input-group">
                    <label className="input-label">
                        {language === 'ru' ? 'Ваше имя' : 'Sizning ismingiz'}
                    </label>
                    <input
                        type="text"
                        value={name}
                        disabled
                        placeholder={language === 'ru' ? 'Имя' : 'Ism'}
                        className="profile-input disabled"
                    />
                    <p className="input-hint">
                        {language === 'ru'
                            ? 'Имя синхронизируется с вашим профилем Telegram'
                            : 'Ism Telegram profilingizdan avtomatik olingan'}
                    </p>
                </div>

                <button
                    className="save-changes-btn"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading
                        ? (language === 'ru' ? 'Сохранение...' : 'Saqlanmoqda...')
                        : (language === 'ru' ? 'Сохранить изменения' : 'O\'zgarishlarni saqlash')}
                </button>
            </div>

            <div className="profile-footer">
                @HUMOMARKET_BOT
            </div>
        </div>
    );
}
