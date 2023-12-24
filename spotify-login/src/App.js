import React from 'react';

class App extends React.Component {
  handleLogin = () => {
    window.location = 'http://localhost:3000/auth/spotify';
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={this.handleLogin}>Login with Spotify</button>
        </header>
      </div>
    );
  }
}

export default App;