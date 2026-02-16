import React, { useState, useEffect, useRef } from 'react';
import './MapPicker.css';

const MapPicker = ({ onConfirm, onCancel, language }) => {
    const mapRef = useRef(null);
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 41.311081, lng: 69.240562 }); // Default: Tashkent
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real scenario, we'd load script here. 
        // For now, assuming Google Maps is available in window or using a placeholder behavior.
        const initMap = () => {
            if (!window.google) {
                setAddress("Google Maps API not loaded. Using mock coordinates.");
                setLoading(false);
                return;
            }

            const map = new window.google.maps.Map(mapRef.current, {
                center: coordinates,
                zoom: 15,
                disableDefaultUI: true,
                zoomControl: true,
            });

            const marker = new window.google.maps.Marker({
                position: coordinates,
                map: map,
                draggable: true,
                icon: {
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: "#6366f1",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                }
            });

            const geocodePosition = (pos) => {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: pos }, (results, status) => {
                    if (status === 'OK') {
                        if (results[0]) {
                            setAddress(results[0].formatted_address);
                        }
                    }
                });
            };

            marker.addListener('dragend', () => {
                const pos = marker.getPosition();
                const newCoords = { lat: pos.lat(), lng: pos.lng() };
                setCoordinates(newCoords);
                geocodePosition(newCoords);
            });

            geocodePosition(coordinates);
            setLoading(false);
        };

        // Mocking behavior if no Google Maps
        if (!window.google) {
            setTimeout(() => {
                setAddress("O'zbekiston, Toshkent, Amir Temur xiyoboni");
                setLoading(false);
            }, 1000);
        } else {
            initMap();
        }
    }, []);

    return (
        <div className="map-picker-overlay">
            <div className="map-header">
                <button className="map-back-btn" onClick={onCancel}>×</button>
                <div className="map-search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={language === 'ru' ? 'Поиск адреса' : 'Manzilni qidirish'}
                        readOnly
                    />
                </div>
            </div>

            <div className="map-container" ref={mapRef}>
                {loading && <div className="map-loading">Yuklanmoqda...</div>}
                {!window.google && !loading && (
                    <div className="map-placeholder">
                        <div className="mock-marker">📍</div>
                        <p>Xarita yuklanmadi (API Key kerak)</p>
                    </div>
                )}
            </div>

            <div className="map-footer">
                <div className="address-container">
                    <p className="address-text">{address || (language === 'ru' ? 'Выбор адреса...' : 'Manzilni tanlang...')}</p>
                </div>
                <button
                    className="confirm-location-btn"
                    onClick={() => onConfirm({ ...coordinates, address })}
                    disabled={loading}
                >
                    {language === 'ru' ? 'Подтвердить' : 'Tasdiqlash'}
                </button>
            </div>
        </div>
    );
};

export default MapPicker;
