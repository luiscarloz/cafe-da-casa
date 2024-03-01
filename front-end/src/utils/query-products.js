import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TEST = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://cafe-da-casa-api.onrender.com/products/cafe');
        setData(response.data);
        setLoading(false);
        console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Product: {data[0].category}</h2>
          <p>Description: {data && data.name}</p>
        </div>
      )}
    </div>
  );
};

export default TEST;
