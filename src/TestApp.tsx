import React from 'react';

export function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Kyntri EHS Platform Test</h1>
      <p>If you can see this, React is working!</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px' }}>
        <h2>✅ Success!</h2>
        <ul>
          <li>✅ Frontend server running</li>
          <li>✅ React components loading</li>
          <li>✅ Basic rendering working</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
          onClick={() => alert('Button works!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default TestApp;