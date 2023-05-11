import { useState } from 'react';
import Link from 'next/link';

const Home = () => {
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);

  const airlineNames = {
    'AA': 'American Airlines',
    'DL': 'Delta Airlines',
    'UA': 'United Airlines',
    'NK': 'Spirit Airlines',
    'AS': 'Alaska Airlines,'
    // Add more airlines as needed
  };

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

  const searchFlights = async () => {
    setError(null);
    const accessToken = await getAccessToken();
    const travelDate = '2023-06-15';
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${location1}&destinationLocationCode=${location2}&departureDate=${travelDate}&adults=1&currencyCode=USD&max=10`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data.data);
      } else {
        setError(`Error fetching flight data: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setError('Error fetching flight data.');
    }
  };

  return (
    <div>
      <h1>Halfway</h1>
      <h2>Between where you and your friends are...</h2>
      <Link href="/realhalfway">Go to Halfway</Link>
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
      {flights.length > 0 && (
        <div>
          <h2>Flight Results</h2>
          <ul>
          {flights.map((flight, index) => {
  // Check if the necessary properties exist before trying to access them
  const segment = flight.itineraries[0]?.segments[0];
  const carrierCode = segment?.carrierCode;
  const airlineName = airlineNames[carrierCode] || carrierCode; // Use the airline name if available, otherwise use the carrier code
  const flightNumber = segment?.number;
  const price = flight.price.total;
  const currency = flight.price.currency;

  return (
    <li key={index}>
      {airlineName && flightNumber
        ? `${airlineName} - ${flightNumber}, Price: ${price} ${currency}`
        : 'Flight details not available'}
    </li>
  );
})}

  <div>

    <b><Link href="/halfway2">Go to Halfway2</Link></b>
  </div> 

          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
