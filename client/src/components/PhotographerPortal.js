import React, { Component } from "react";
import { Link, Route, BrowserRouter } from "react-router-dom";
import Jobs from "./Jobs"
import AccountSettings from "./AccountSettings"
import "../css/styles.css";

export default class PhotographerPortal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uni: "",
      firstName: "",
      lastName: "",
      loading: true,
      jobs: []
    };
  }

  componentDidMount() {
    fetch("/api/getUser")
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .then(resJson => {
        this.setState({
          loading: false,
          uni: resJson.uni,
          firstName: resJson.firstName,
          lastName: resJson.lastName
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, redirect: true });
      });
  }

  render() {
    return (
      <div className="container">
        <div className="portal">
          <div className="sidebar">
            <div className="user">
              <ul>
                <li className="fullName">{this.state.firstName} {this.state.lastName}</li>
                <li>Account Settings</li>
                <li>Logout</li>
              </ul>
            </div>
            <div className="logo">COLUMBIA PHOTOGRAPHY ASSOCIATION</div>
          </div>
          <BrowserRouter>
            <Route exact path="/"
                render={(props) => <Jobs {...props} uni={this.state.uni} />}
            />
            <Route path="/settings"
                render={(props) => <AccountSettings {...props} uni={this.state.uni} />}
            />
          </BrowserRouter>
        </div>
      </div>
    );
  }
}
