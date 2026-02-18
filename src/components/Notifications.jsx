import React from 'react';
import './Notifications.css';

export default function Notifications({ notifications, language, onMarkRead }) {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="notifications-view empty">
                <div className="empty-icon">🔔</div>
                <p>{language === 'ru' ? 'Uvedomleniy poka net' : 'Hozircha bildirishnomalar yo\'q'}</p>
            </div>
        );
    }

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
        <div className="notifications-view">
            <h2 className="view-title">
                {language === 'ru' ? 'Uvedomleniya' : 'Bildirishnomalar'}
            </h2>
            <div className="notifications-list">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                        onClick={() => !notification.is_read && onMarkRead(notification.id)}
                    >
                        <div className="notification-header">
                            <h3 className="notification-title">{notification.title}</h3>
                            <span className="notification-time">{formatDate(notification.created_at)}</span>
                        </div>
                        <p className="notification-desc">{notification.description}</p>
                        {!notification.is_read && <div className="unread-dot"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
