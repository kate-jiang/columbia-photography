import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class JobPosting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobName: "",
      date: "",
      time: "",
      location: "",
      compensation: "",
      details: "",
      applied: false
    }
  }

  componentDidMount () {
    fetch("/api/jobs/" + this.props.match.params.jobId)
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
          jobName: resJson.jobName,
          date: resJson.date,
          time: resJson.time,
          location: resJson.location,
          compensation: resJson.compensation,
          details: resJson.details,
          applied: resJson.photographers.includes(this.props.uni)
        })
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  }

  apply = () => {
    fetch("/api/applyToJob", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.setState({ applied: true })
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  }

  withdraw = () => {
    fetch("/api/withdrawFromjob", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.setState({ applied: false })
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  }

  render() {
    return (
      <div className="jobPosting">
        <ul className="jobDetails">
          <li><h2>{this.state.jobName}</h2></li>
          <li><strong>Date:</strong> {this.state.date}</li>
          <li><strong>Time:</strong> {this.state.time}</li>
          <li><strong>Location:</strong> {this.state.location}</li>
          <li><strong>Compensation:</strong> ${this.state.compensation}</li>
          <li><strong>Details:</strong> {this.state.details}</li>
        </ul>
        <div className="jobOptions">
          {this.state.applied ? (
            <button onClick={this.withdraw}>Withdraw</button>
          ) : (
            <button onClick={this.apply}>Apply</button>
          )}
          <Link to="/"><button>Back</button></Link>
        </div>
      </div>
    )
  }
}
