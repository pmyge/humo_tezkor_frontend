import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import './ChatSupport.css';

export default function ChatSupport({ user, language, onBack }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        loadMessages();
        // Start polling for new messages every 3 seconds
        pollingInterval.current = setInterval(loadMessages, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [user?.telegram_user_id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        if (!user?.telegram_user_id) return;
        try {
            const data = await api.getChatMessages(user.telegram_user_id);
            setMessages(data.messages || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user?.telegram_user_id) return;

        const currentMsg = newMessage;
        setNewMessage('');

        try {
            const response = await api.sendChatMessage(user.telegram_user_id, currentMsg);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally restore message to input if send fails
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className="cs-container">
            {/* Header */}
            <header className="cs-header">
                <button className="cs-back-btn" onClick={onBack}>
                    <span className="cs-back-icon">‹</span>
                </button>
                <div className="cs-header-info">
                    <h2 className="cs-title">
                        {language === 'ru' ? 'Служба поддержки' : 'Qo\'llab quvvatlash xizmati'}
                    </h2>
                    <span className="cs-status">Online</span>
                </div>
                <button className="cs-call-btn">
                    <span className="cs-call-icon">📞</span>
                </button>
            </header>

            {/* Chat Body */}
            <div className="cs-body">
                {loading && messages.length === 0 ? (
                    <div className="cs-loading">
                        <div className="cs-spinner"></div>
                    </div>
                ) : (
                    <div className="cs-messages">
                        {messages.length === 0 ? (
                            <div className="cs-empty">
                                <p>{language === 'ru' ? 'Как мы можем вам помочь?' : 'Sizga qanday yordam bera olamiz?'}</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
                                    className={`cs-message-row ${msg.is_from_admin ? 'admin' : 'user'}`}
                                >
                                    <div className="cs-message-bubble">
                                        <p className="cs-message-text">{msg.message}</p>
                                        <span className="cs-message-time">{formatTime(msg.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Footer */}
            <form className="cs-footer" onSubmit={handleSendMessage}>
                <button type="button" className="cs-attach-btn">
                    <span className="cs-attach-icon">📎</span>
                </button>
                <input
                    type="text"
                    className="cs-input"
                    placeholder={language === 'ru' ? 'Сообщение' : 'Xabar'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="cs-send-btn" disabled={!newMessage.trim()}>
                    <span className="cs-send-icon">▲</span>
                </button>
            </form>
        </div>
    );
}
