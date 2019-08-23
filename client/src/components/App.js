import React, { Component } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from "./Login";
import PhotographerPortal from "./PhotographerPortal";
import PhotographerSelect from "./PhotographerSelect";
import HireForm from "./HireForm";
import Confirmation from "./Confirmation";
import { withAuth } from "./Auth";

class App extends Component {

  render() {
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Route path="/hire" component={HireForm} />
            <Route path="/confirm" component={Confirmation} />
            <Route exact path="/:jobId/:clientId" component={PhotographerSelect} />
            <Route path="/login" component={Login} />
            <Route path="/" component={withAuth(PhotographerPortal)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
