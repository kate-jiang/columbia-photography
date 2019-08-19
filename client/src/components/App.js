import React, { Component } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from "./Login";
import PhotographerPortal from "./PhotographerPortal";
import HireForm from "./HireForm";
import { withAuth } from "./Auth";

class App extends Component {

  render() {
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Route path="/hire" component={HireForm} />
            <Route path="/login" component={Login} />
            <Route path="/" component={withAuth(PhotographerPortal)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
            // props.location.params.jobId
            // <Route path="/forgotPassword/:code"/>
// class ForgotPassword extends Component {
//
//   componentDidMount() {
//     // '/forgotPassword?code=123'
//     const url = new URL(window.location)
//     const code = url.searchParams.get('code')
//     // make ajax request to server validating code
//     // if not valid, show message + redirect
//   }
//
//   submitNewPassword() {
//     // submit code + newPass
//   }
// }
export default App;
