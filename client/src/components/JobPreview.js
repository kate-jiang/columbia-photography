import React, { Component } from "react";

export default class JobPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applied: false
    }
  }

  componentDidMount() {
    console.log(this.props.job.photographers);
    if (this.props.job.photographers.indexOf(this.props.uni) > -1) {
      this.setState({ applied: true });
    }
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
          <button onClick={this.apply} disabled={this.state.applied}>
            {this.state.applied ? 'Applied' : 'Apply'}
          </button>
          <button>More Info</button>
        </div>
      </div>
    )
  }

}
