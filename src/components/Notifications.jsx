import React from 'react';
import './Notifications.css';

export default function Notifications({ notifications, language, onMarkRead, onBack }) {
    const isEmpty = !notifications || notifications.length === 0;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`notifications-view ${isEmpty ? 'empty' : ''}`}>
            <div className="view-header">
                <button className="back-btn" onClick={onBack}>←</button>
                <h2 className="view-title">
                    {language === 'ru' ? 'Уведомления' : 'Bildirishnomalar'}
                </h2>
            </div>

            {isEmpty ? (
                <div className="empty-state">
                    <div className="empty-icon">🔔</div>
                    <p>{language === 'ru' ? 'Уведомлений пока нет' : 'Hozircha bildirishnomalar yo\'q'}</p>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                            onClick={() => !notification.is_read && onMarkRead(notification.id)}
                        >
                            <div className="notification-header">
                                <h3 className="notification-title">
                                    {language === 'ru'
                                        ? (notification.title_ru || notification.title)
                                        : (notification.title_uz || notification.title)}
                                </h3>
                                <span className="notification-time">{formatDate(notification.created_at)}</span>
                            </div>
                            <p className="notification-desc">
                                {language === 'ru'
                                    ? (notification.description_ru || notification.description)
                                    : (notification.description_uz || notification.description)}
                            </p>
                            {!notification.is_read && <div className="unread-dot"></div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
