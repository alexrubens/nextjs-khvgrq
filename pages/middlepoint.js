import { useState } from 'react';

function MiddlePoint() {
  const [loc1, setLoc1] = useState('');
  const [loc2, setLoc2] = useState('');
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState(null);

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getAccessToken = async () => {
  const apiKey = 'Z38kFL4gr2OGGPq6tG4ZOX7tayurhDfF';
  const apiSecret = '33r8UF8KI38pmuN0';

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}&scope=openid`, // Add scope=openid
  });

  if (!response.ok) {
    console.log('Error in getAccessToken:', response.status, response.statusText);
  }

  const data = await response.json();
  console.log('Access token data:', data);

  return data.access_token;
};


  const getAirportCoordinates = async (iataCode, accessToken) => {
    const url = `https://api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&iataCode=${iataCode}`;
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    };
  
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log('Airport data:', data); // Add this line
      if (data.data && data.data.length > 0) {
        const airport = data.data[0];
        return {
          latitude: airport.geoCode.latitude,
          longitude: airport.geoCode.longitude,
        };
      }
    } else {
      console.log(`Error fetching airport data for ${iataCode}: ${response.status} ${response.statusText}`); // Add this line
      return null;
    }
  };
  
  const searchFlights = async (loc1, loc2) => {
    setError(null);

    const accessToken = await getAccessToken();

    const coordinates1 = await getAirportCoordinates(loc1, accessToken);
    const coordinates2 = await getAirportCoordinates(loc2, accessToken);

    if (coordinates1 && coordinates2) {
      const distance = haversineDistance(
        coordinates1.latitude, coordinates1.longitude,
        coordinates2.latitude, coordinates2.longitude
      );

      // You can decide how to use the distance value to select a destination
      // and reduce the number of API requests.
      // For example, you can consider destinations within a certain range
      // of the halfway point.
    } else {
      setError('Error fetching coordinates for one or both airports.');
    }
  };
  return (
    <div>
      <h1>Halfway - Find the Cheapest Mutual Destination</h1>
      <div>
        <input
          type="text"
          placeholder="Enter airport code for location 1"
          value={loc1}
          onChange={(e) => setLoc1(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter airport code for location 2"
          value={loc2}
          onChange={(e) => setLoc2(e.target.value)}
        />
      </div>
      <button onClick={() => searchFlights(loc1, loc2)}>Find Destination</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {destination && <p>The best mutual destination is: {destination}</p>}
    </div>
  );
}

export default MiddlePoint;