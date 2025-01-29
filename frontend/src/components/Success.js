import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Transakcja się powiodła!</h1>
      <p>Dziękujemy za dokonanie wpłaty.</p>
      <button
        onClick={() => navigate('/exchange-rates')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px',
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          color: '#333',
          marginTop: '20px',
        }}
      >
        Powróć na stronę główną
      </button>
    </div>
  );
};

export default Success;
