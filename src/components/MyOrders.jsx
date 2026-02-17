import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './MyOrders.css';

const MyOrders = ({ user, language, onBack }) => {
    const [activeTab, setActiveTab] = useState('active'); // 'active' (Faol) or 'confirmed' (Tasdiqlangan)
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.id;
            const data = activeTab === 'active'
                ? await api.getActiveOrders(userId)
                : await api.getConfirmedOrders(userId);
            setOrders(data.orders || []);
        } catch (e) {
            console.error('Failed to fetch orders:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-orders-view">
            <div className="orders-header">
                <span className="back-btn" onClick={onBack}>←</span>
                <h2>{language === 'ru' ? 'МОИ ЗАКАЗЫ' : 'BUYURTMALARIM'}</h2>
            </div>

            <div className="orders-tabs">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    {language === 'ru' ? 'Активные' : 'Faol'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('confirmed')}
                >
                    {language === 'ru' ? 'Подтвержденные' : 'Tasdiqlangan'}
                </button>
            </div>

            <div className="orders-content">
                {loading ? (
                    <div className="loading-state">...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        {language === 'ru' ? 'У вас нет заказов' : 'Buyurtmalaringiz mavjud emas'}
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <span className="order-id">#{order.id}</span>
                                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="order-items">
                                    {order.items.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <span>{language === 'ru' ? (item.product_name_ru || item.product_name) : item.product_name}</span>
                                            <span>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-total">
                                    <span>{language === 'ru' ? 'Итого:' : 'Jami:'}</span>
                                    <span>{parseFloat(order.total_amount).toLocaleString()} UZS</span>
                                </div>
                                <div className={`status-badge ${order.status}`}>
                                    {order.status === 'pending' ? (language === 'ru' ? 'Ожидание' : 'Kutilmoqda') : (language === 'ru' ? 'Подтвержден' : 'Tasdiqlangan')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
