import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    response: '',
  };

  componentDidMount() {

  }

  goForward() {
    console.log('goForward method');

    fetch('http://localhost:5000/goforward', {
      method: 'POST', // or 'PUT'
    })
      .then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(response => console.log('Success:', response));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">{this.state.response}</p>
        <button type="button" className="btn btn-primary" onClick={this.goForward}>Test</button>
      </div>
    );
  }
}

export default App;
