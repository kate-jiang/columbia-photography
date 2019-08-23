import React, { Component } from "react";


export default class HireForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      clientEmail: "",
      clientPhone: "",
      jobName: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      details: ""
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    fetch("/api/createJob",  {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.props.history.push({
          pathname: "/confirm",
          state: { type: "hire" }
        });
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error creating job request. Please email columbia-photography@columbia.edu for assistance.");
    });
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
    console.log(value);
  };

  render() {
    return (
      <div className="container">
        <div className="hire">
          <div className="hireTitle">HIRE CPA</div>
          <div className="break"></div>
          <form className="hireForm" onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="hireInput"
              value={this.state.firstName}
              onChange={this.handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="hireInput"
              value={this.state.lastName}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <input
              type="email"
              name="clientEmail"
              placeholder="Email"
              className="hireInput"
              value={this.state.clientEmail}
              onChange={this.handleInputChange}
              required
            />
            <input
              type="tel"
              name="clientPhone"
              placeholder="Phone Number"
              className="hireInput"
              value={this.state.clientPhone}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <input
              type="text"
              name="jobName"
              placeholder="Job Name"
              className="hireInput"
              value={this.state.jobName}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <div className="hireInputWrap">
              <div className="hireInputLabel">Date</div>
              <div className="break"></div>
              <input
                type="date"
                name="date"
                placeholder="Date"
                className="hireInput"
                value={this.state.date}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <div className="hireInputWrap">
              <div className="hireInputLabel">Start Time</div>
              <div className="break"></div>
              <input
                type="time"
                name="startTime"
                className="hireInput"
                value={this.state.startTime}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <div className="hireInputWrap">
              <div className="hireInputLabel">End Time</div>
              <div className="break"></div>
              <input
                type="time"
                name="endTime"
                className="hireInput"
                value={this.state.endTime}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <div className="break"></div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="hireInput"
              value={this.state.location}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <input
              type="text"
              name="details"
              placeholder="What is your event/project? What are your goals for these photos?"
              className="hireInput"
              value={this.state.details}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <input type="submit" value="Submit" className="submitButton" />
          </form>
        </div>
      </div>
    )
  }
}
