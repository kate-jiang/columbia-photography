import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./Login";
import PhotographerPortal from "./PhotographerPortal";
import withAuth from "./withAuth";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ""
    };
  }

  render() {
    return (
      <div>
        <Switch>
          <Route path="/" exact component={withAuth(PhotographerPortal)} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    );
  }
}

export default App;
