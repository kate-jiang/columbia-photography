import React, { Component } from "react";

export default class JobPreview extends Component {

  apply() {

  }

  render() {
    return (
      <div className="jobPreview">
        <ul className="jobDetails">
          <li><strong>Name:</strong> {this.props.job.jobName}</li>
          <li><strong>Date:</strong> {this.props.job.date}</li>
          <li><strong>Time:</strong> {this.props.job.time}</li>
          <li><strong>Location:</strong> {this.props.job.location}</li>
          <li><strong>Compensation:</strong> {this.props.job.compensation}</li>
        </ul>
        <div className="jobOptions">
          <button onClick={this.apply}>Apply</button>
          <button>More Info</button>
        </div>
      </div>
    )
  }

}
