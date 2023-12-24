import React from 'react';
import Button from 'react-bootstrap/Button';

const App = () => {
  const handleLogin = () => {
    window.location = 'http://localhost:8888/login';
  };

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