import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ""
    };
  }

  componentDidMount() {
    this.fetchText();
  }

  fetchText = async () => {
    const response = await fetch("/text");
    const responseJson = await response.json();
    console.log(responseJson);
    this.setState({ text: responseJson.text });
  };

  render() {
    return (
      <div>
        <b>{this.state.text}</b>
      </div>
    );
  }
}

export default App;
