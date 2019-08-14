import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import Login from "./Login";
import withAuth from "./withAuth";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      message: "Success"
    };
  }

  render() {
    return (
      <div>
        <h1>Home</h1>
        <p>{this.state.message}</p>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ""
    };
  }

  componentDidMount() {
    //this.fetchText();
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
        <Switch>
          <Route path="/" exact component={withAuth(Home)} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    );
  }
}

export default App;
