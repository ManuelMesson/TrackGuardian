import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import LikedTracks from './LikedTracks'; // Make sure to import the LikedTracks component

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8888/isLoggedIn')
      .then(response => response.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        console.log(data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleLogin = () => {
    window.location = 'http://localhost:8888/login';
  };

  if (isLoggedIn) {
    return <LikedTracks />;
  }

  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#282c34' }}>
      <header className="App-header">
        <Button onClick={handleLogin} variant="success" size="lg">
          Login with Spotify
        </Button>
      </header>
    </div>
  );
}

export default App;