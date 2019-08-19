import React, { Component } from "react";
import { NavLink, Route } from "react-router-dom";
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

  logout() {
    // todo
  }

  render() {
    return (

      <div className="container">
        <div className="portal">
          <div className="sidebar">
            <div className="user">
              <ul>
                <li className="fullName">{this.state.firstName} {this.state.lastName}</li>
                <li><NavLink activeClassName="selected" exact to="/">Dashboard</NavLink></li>
                <li><NavLink activeClassName="selected" to="/settings">Account Settings</NavLink></li>
                <li><NavLink to="/login" onClick={this.logout}>Logout</NavLink></li>
              </ul>
            </div>
            <div className="logo">COLUMBIA PHOTOGRAPHY ASSOCIATION</div>
          </div>

            <Route exact path="/"
                render={(props) => <Jobs {...props} uni={this.state.uni} />}
            />
            <Route path="/settings"
                render={(props) => <AccountSettings {...props} uni={this.state.uni} />}
            />
        </div>
      </div>
    );
  }
}
