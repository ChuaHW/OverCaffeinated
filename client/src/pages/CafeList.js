import { useEffect, useState } from 'react';
import axios from 'axios';

function CafeList() {
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/cafes')
      .then(res => setCafes(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Discover Cafes</h1>
      {cafes.map(cafe => (
        <div key={cafe.id} style={{ border: '2px solid #6F4E37', margin: '0.5rem 0', padding: '1rem', borderRadius: '8px' }}>
          <h2>{cafe.name}</h2>
          <p>{cafe.address}</p>
          <p>{cafe.description}</p>
        </div>
      ))}
    </div>
  );
}

export default CafeList;