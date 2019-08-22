import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class JobPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applied: false,
      admin: false
    }
  }

  componentDidMount() {
    if (this.props.job.photographers.indexOf(this.props.uni) > -1) {
      this.setState({ applied: true });
    }

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

  apply = () => {
    fetch("/api/applyToJob", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.job._id }),
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
      body: JSON.stringify({ jobId: this.props.job._id }),
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
      <div className="jobPreview">
        <ul className="jobDetails">
          <li><strong>Name:</strong> {this.props.job.jobName}</li>
          <li><strong>Date:</strong> {this.props.job.date}</li>
          <li><strong>Time:</strong> {this.props.job.time}</li>
          <li><strong>Location:</strong> {this.props.job.location}</li>
          <li><strong>Compensation:</strong> ${this.props.job.compensation}</li>
        </ul>
        <div className="jobOptions">
          {this.props.job.approved &&
            <>
            {this.state.applied ? (
              <button onClick={this.withdraw}>Withdraw</button>
            ) : (
              <button onClick={this.apply}>Apply</button>
            )}
            {/* <Link to={`/jobs/${this.props.job._id}`}><button>More Info</button></Link> */}
            </>
          }
          {this.state.admin &&
            <Link to={`/jobs/${this.props.job._id}/edit`}><button>Edit</button></Link>
          }
          {this.state.admin &&
            <Link to={`/jobs/${this.props.job._id}/manage`}><button>Manage</button></Link>
          }
        </div>
      </div>
    )
  }

}
