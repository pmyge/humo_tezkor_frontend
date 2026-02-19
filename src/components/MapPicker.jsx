import React, { useState, useEffect, useRef } from 'react';
import './MapPicker.css';

const MapPicker = ({ onConfirm, onCancel, language }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);

    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 41.311081, lng: 69.240562 }); // Default: Tashkent
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Ensure Leaflet is loaded
        if (!window.L) {
            console.error("Leaflet library not found!");
            setAddress("Xarita kutubxonasi yuklanmadi");
            setLoading(false);
            return;
        }

        if (!mapInstance.current && mapRef.current) {
            // Initialize Leaflet Map
            const map = window.L.map(mapRef.current, {
                center: [coordinates.lat, coordinates.lng],
                zoom: 15,
                zoomControl: false,
                attributionControl: false
            });

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Custom Purple Marker Icon
            const purpleIcon = window.L.divIcon({
                className: 'custom-purple-marker',
                html: '<div class="marker-pin"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            const marker = window.L.marker([coordinates.lat, coordinates.lng], {
                icon: purpleIcon,
                draggable: true
            }).addTo(map);

            mapInstance.current = map;
            markerInstance.current = marker;

            const updateAddress = async (lat, lng) => {
                setLoading(true);
                try {
                    // OpenStreetMap Nominatim API for reverse geocoding
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language === 'ru' ? 'ru' : 'uz'}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setAddress(data.display_name);
                    }
                } catch (e) {
                    console.error('Reverse geocoding error:', e);
                    setAddress('Manzil aniqlanmadi');
                } finally {
                    setLoading(false);
                }
            };

            marker.on('dragend', (e) => {
                const { lat, lng } = e.target.getLatLng();
                setCoordinates({ lat, lng });
                updateAddress(lat, lng);
            });

            // Handle map click to move marker
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setCoordinates({ lat, lng });
                updateAddress(lat, lng);
            });

            // Initial geocode
            updateAddress(coordinates.lat, coordinates.lng);

            // Important: Fix for Leaflet in absolute positioned containers
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [language]);

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery) {
            setLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=${language === 'ru' ? 'ru' : 'uz'}`);
                const data = await res.json();
                if (data && data[0]) {
                    const { lat, lon, display_name } = data[0];
                    const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };

                    setCoordinates(newCoords);
                    setAddress(display_name);

                    if (mapInstance.current) {
                        mapInstance.current.setView([newCoords.lat, newCoords.lng], 16);
                        markerInstance.current.setLatLng([newCoords.lat, newCoords.lng]);
                    }
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoordinates(newCoords);
                if (mapInstance.current) {
                    mapInstance.current.setView([newCoords.lat, newCoords.lng], 16);
                    markerInstance.current.setLatLng([newCoords.lat, newCoords.lng]);
                }
                // Update address trigger
                if (markerInstance.current) {
                    const { lat, lng } = markerInstance.current.getLatLng();
                    // Call updateAddress logic manually or refactor it to a function
                    // For brevity, we'll just fire the event if possible or just trigger the logic
                    markerInstance.current.fire('dragend');
                }
            });
        }
    };

    const zoomIn = () => mapInstance.current?.zoomIn();
    const zoomOut = () => mapInstance.current?.zoomOut();

    return (
        <div className="map-picker-overlay">
            <div className="map-header">
                <button className="map-back-btn" onClick={onCancel}>
                    <span className="close-x">✕</span>
                </button>
                <div className="map-search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={language === 'ru' ? 'Поиск адреса' : 'Manzilni qidirish'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="map-container" ref={mapRef}>
                <div className="map-controls">
                    <div className="zoom-controls">
                        <button onClick={zoomIn}>+</button>
                        <button onClick={zoomOut}>−</button>
                    </div>
                    <button className="my-location-btn" onClick={handleMyLocation}>
                        <span className="gps-icon">🚀</span>
                    </button>
                </div>
            </div>

            <div className="map-footer">
                <div className="address-container">
                    <p className="address-text">{loading ? (language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...') : address}</p>
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
