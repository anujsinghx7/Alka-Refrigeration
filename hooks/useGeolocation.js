'use client';

import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );

            if (!res.ok) throw new Error('Geocoding failed');
            const data = await res.json();
            const addr = data.address;
            let formattedAddress = '';

            if (addr) {
              const parts = [
                addr.neighbourhood || addr.suburb || addr.hamlet || '',
                addr.city || addr.town || addr.village || '',
                addr.state_district || addr.county || '',
                addr.state || '',
                addr.postcode || '',
              ].filter(Boolean);
              formattedAddress = parts.join(', ');
            }

            if (!formattedAddress && data.display_name) {
              formattedAddress = data.display_name;
            }

            const finalLocation = formattedAddress || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            setAddress(finalLocation);
            setLoading(false);
            resolve(finalLocation);
          } catch (err) {
            const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            setAddress(fallback);
            setLoading(false);
            resolve(fallback);
          }
        },
        (geoError) => {
          let msg = 'Unable to detect location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            msg = 'Location permission denied by user.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location detection timed out.';
          }
          setError(msg);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { detectLocation, loading, error, address };
}
