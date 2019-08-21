import React, { Component } from "react";
import { NavLink, Route } from "react-router-dom";
import Jobs from "./Jobs"
import Drafts from "./Drafts"
import JobPosting from "./JobPosting";
import JobSettings from "./JobSettings";
import AccountSettings from "./AccountSettings"
import { withAdminAuth } from "./Auth";
import "../css/styles.css";

export default class PhotographerPortal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uni: "",
      firstName: "",
      lastName: "",
      loading: true,
      admin: false,
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
      });

    fetch("/api/checkAdminToken")
      .then(res => {
        if (res.status === 200) {
          this.setState({ admin: true });
        } else {
          this.setState({ admin: false });
        }
      })
      .catch(err => {
        console.error(err);
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
                <li><NavLink activeClassName="selected" exact to="/">Jobs</NavLink></li>
                {this.state.admin && <li><NavLink activeClassName="selected" exact to="/drafts">Drafts</NavLink></li>}
                <li><NavLink activeClassName="selected" to="/settings">Account Settings</NavLink></li>
                <li><NavLink to="/login" onClick={this.logout}>Logout</NavLink></li>
              </ul>
            </div>
            <div className="logo">COLUMBIA PHOTOGRAPHY ASSOCIATION</div>
          </div>
            <Route exact path="/"
                render={(props) => <Jobs {...props} uni={this.state.uni} />}
            />
            <Route exact path="/drafts"
                render={(props) => <Drafts {...props} uni={this.state.uni} />}
            />
            <Route exact path="/jobs/:jobId"
                render={(props) => <JobPosting {...props} uni={this.state.uni}/>}
            />
            <Route exact path="/jobs/:jobId/edit"
                component={withAdminAuth(JobSettings)}
            />
            <Route path="/settings"
                render={(props) => <AccountSettings {...props} uni={this.state.uni} />}
            />
        </div>
      </div>
    );
  }
}
