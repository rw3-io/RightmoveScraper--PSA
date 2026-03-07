import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { PropertyData } from './MapView';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const featuredIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LeafletMapViewProps {
    properties: PropertyData[];
    featuredIds: string[];
}

function formatPrice(price: number | string | undefined): string {
    if (price === undefined || price === null || price === '') return 'N/A';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return 'N/A';
    return `£${num.toLocaleString('en-GB')}`;
}

function formatDistance(distance: number | string | undefined): string {
    if (distance === undefined || distance === null || distance === '') return 'N/A';
    const num = typeof distance === 'string' ? parseFloat(distance) : distance;
    if (isNaN(num)) return 'N/A';
    return num.toFixed(2);
}

function ChangeView({ properties }: { properties: PropertyData[] }) {
    const map = useMap();

    useEffect(() => {
        const validPoints = properties
            .filter(p => p.latitude && p.longitude && !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)))
            .map(p => [Number(p.latitude), Number(p.longitude)] as [number, number]);

        if (validPoints.length > 0) {
            const bounds = L.latLngBounds(validPoints);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, properties]);

    return null;
}

export default function LeafletMapView({ properties, featuredIds }: LeafletMapViewProps) {
    const validProperties = properties.filter(
        p => p.latitude && p.longitude && !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude))
    );

    const defaultCenter: [number, number] = [52.035, -2.43];

    return (
        <MapContainer
            center={defaultCenter}
            zoom={10}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
            className="leaflet-map-container"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView properties={validProperties} />
            {validProperties.map((property, idx) => {
                const lat = Number(property.latitude);
                const lng = Number(property.longitude);
                const isFeatured = featuredIds.includes(String(property.id));
                const key = property.id ? String(property.id) : `${lat}-${lng}-${idx}`;

                return (
                    <Marker 
                        key={key} 
                        position={[lat, lng]}
                        icon={isFeatured ? featuredIcon : new L.Icon.Default()}
                    >
                        <Popup>
                            <div className="popup-content leaflet-popup-override">
                                {property.image_url && (
                                    <img src={property.image_url} alt="Property" className="popup-image" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
                                )}
                                <div className="popup-price" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#3b82f6' }}>{formatPrice(property.price)}</div>
                                <div className="popup-type" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {property.type || 'Property'}
                                    {property.bedrooms ? ` · ${property.bedrooms} bed` : ''}
                                    {property.sqft ? ` · ${property.sqft} sq ft` : ''}
                                </div>
                                <div className="popup-address" style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>{property.address || 'Address not available'}</div>

                                <div className="popup-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    {property.nearest_station_distance !== undefined && (
                                        <span className="popup-tag" style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            🚉 {formatDistance(property.nearest_station_distance)} mi ({property.nearest_station_name})
                                        </span>
                                    )}
                                    {property.days_on_market && (
                                        <span className="popup-tag" style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            📅 {property.days_on_market}d on market
                                        </span>
                                    )}
                                </div>

                                {property.url && (
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        <a
                                            href={property.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="popup-link"
                                            style={{ margin: 0, color: '#3b82f6', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}
                                        >
                                            View on Rightmove →
                                        </a>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="popup-link google-maps-link"
                                            style={{ margin: 0, color: '#10b981', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}
                                        >
                                            Google Maps 📍
                                        </a>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
