import { useState } from 'react';

const Halfway2 = () => {
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState(null);

  const getAccessToken = async () => {
    const apiKey = 'Z38kFL4gr2OGGPq6tG4ZOX7tayurhDfF';
    const apiSecret = '33r8UF8KI38pmuN0';

    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
    });

    if (!response.ok) {
      console.log('Error in getAccessToken:', response.status, response.statusText);
    }

    const data = await response.json();
    console.log('Access token data:', data);

    return data.access_token;
  };

  const getCheapestFlights = async (origin, accessToken) => {
    const travelDate = '2023-06-15';
    const url = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&departureDate=${travelDate}&adults=1&currencyCode=USD&max=250`;
  
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    };
  
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
  
    if (response.ok) {
      const data = await response.json();
      return data.data.map(flight => ({
        destination: flight.itineraries[0].segments[0].arrival.iataCode,
        price: flight.price.total,
      }));
    } else {
      console.log(`Error fetching flight data for ${origin}: ${response.status} ${response.statusText}`);
      return [];
    }
  };
  
  
  const searchFlights = async () => {
    setError(null);
  
    const accessToken = await getAccessToken();
  
    const flights1 = await getCheapestFlights(location1, accessToken);
    const flights2 = await getCheapestFlights(location2, accessToken);
  
    console.log('Flights from location 1:', flights1);
    console.log('Flights from location 2:', flights2);
  
    const destinations1 = flights1.map(flight => flight.destination);
    const destinations2 = flights2.map(flight => flight.destination);
  
    const mutualDestinations = destinations1.filter(destination => destinations2.includes(destination));
  
    if (mutualDestinations.length > 0) {
      let cheapestTotalPrice = Infinity;
      let cheapestDestination = null;
  
      for (const destination of mutualDestinations) {
        const price1 = flights1.find(flight => flight.destination === destination).price;
        const price2 = flights2.find(flight => flight.destination === destination).price;
        const totalPrice = parseFloat(price1) + parseFloat(price2);
  
        if (totalPrice < cheapestTotalPrice && totalPrice <= 1000000) {
          cheapestTotalPrice = totalPrice;
          cheapestDestination = destination;
        }
      }
  
      if (cheapestDestination) {
        setDestination(cheapestDestination);
      } else {
        setError('No mutual destinations found within the price limit.');
      }
    } else {
      setError('No mutual destinations found.');
    }
  };
  
  
  
  return (
    <div>
      <h1>Halfway2.0 - Find the Cheapest Mutual Destination</h1>
      <div>
        <input
          type="text"
          placeholder="Location 1"
          value={location1}
          onChange={(e) => setLocation1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location 2"
          value={location2}
          onChange={(e) => setLocation2(e.target.value)}
        />
        <button onClick={searchFlights}>Search Flights</button>
      </div>
      {error && <p>{error}</p>}
      {destination && <p>The cheapest mutual destination is {destination}.</p>}
    </div>
  );
};

export default Halfway2;
