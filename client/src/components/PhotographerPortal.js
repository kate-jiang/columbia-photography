import React, { Component } from "react";
import JobPreview from "./JobPreview";
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

    fetch("/api/jobs")
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
          jobs: resJson
        })
      })
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
          <div className="jobs">
            {this.state.jobs.map(job => <JobPreview job={job} uni={this.state.uni} key={job._id} />)}
          </div>
        </div>
      </div>
    );
  }
}
