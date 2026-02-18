import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ onClose, language }) => {
    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-animation">✓</div>
                <h2>{language === 'ru' ? 'Заказ принят!' : 'Qabul qilindi!'}</h2>
                <p>
                    {language === 'ru'
                        ? 'Ваш заказ успешно оформлен. Вы можете отслеживать его в разделе Мои заказы.'
                        : 'Buyurtmangiz muvaffaqiyatli qabul qilindi. Uni Buyurtmalarim bo\'limida kuzatishingiz mumkin.'}
                </p>
                <button className="ok-btn" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default SuccessModal;
