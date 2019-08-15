import React, { Component } from "react";

export default class JobPreview extends Component {

  render() {
    return (
      <div className="jobPreview">
        <ul>
          <li><strong>Name:</strong> {this.props.job.name}</li>
          <li><strong>Date:</strong> {this.props.job.date}</li>
          <li><strong>Time:</strong> {this.props.job.time}</li>
          <li><strong>Location:</strong> {this.props.job.location}</li>
          <li><strong>Compensation:</strong> {this.props.job.compensation}</li>
        </ul>
      </div>
    )
  }

}
