import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Orders.css';

const Orders = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const telegram = window.Telegram.WebApp;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const userId = telegram.initDataUnsafe?.user?.id;
                if (!userId) {
                    console.error('Telegram user not found');
                    setLoading(false);
                    return;
                }

                // First check if user is registered (backend check)
                const userInfo = await api.getUserInfo(userId);
                if (!userInfo || !userInfo.phone_number) {
                    navigate('/registration');
                    return;
                }

                const data = await api.getOrders(userId, activeTab === 'active');
                setOrders(data.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab, navigate, telegram]);

    return (
        <div className="orders-container">
            <div className="orders-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <h1>Buyurtmalarim</h1>
            </div>

            <div className="tabs">
                <div
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Faol
                </div>
                <div
                    className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    Bar xasi
                </div>
            </div>

            <div className="orders-list">
                {loading ? (
                    <div className="loading">Yuklanmoqda...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-shopping-basket"></i>
                        </div>
                        <h3>Hozircha buyurtmalar yo'q</h3>
                        <p>Buyurtma berish uchun do'kon bo'limiga o'ting.</p>
                        <button className="shop-btn" onClick={() => navigate('/')}>
                            Do'konga o'tish
                        </button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-id">Buyurtma #{order.id}</span>
                                <span className={`order-status ${order.status}`}>
                                    {order.status === 'active' ? 'Faol' : 'Yakunlandi'}
                                </span>
                            </div>
                            <div className="order-items">
                                {order.items?.map(item => (
                                    <div key={item.id} className="order-item">
                                        <span>{item.product_name} x{item.quantity}</span>
                                        <span>{item.price} so'm</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-footer">
                                <span className="total-label">Jami:</span>
                                <span className="total-value">{order.total_amount} so'm</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
