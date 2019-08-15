import React, { Component } from "react";


export default class JobForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobName: "",
      date: "",
      startTime: "",
      endTime: "",
      details: "",
    }
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  };

  render() {
    return (
      <div className="container">
        <div className="hire">
          <div className="hireTitle">HIRE CPA</div>
          <div className="break"></div>
          <form className="hireForm">
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
              name="email"
              placeholder="Email"
              className="hireInput"
              value={this.state.email}
              onChange={this.handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="hireInput"
              value={this.state.phone}
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
              name="details"
              placeholder="What is your event/project? What are your goals for these photos?"
              className="hireInput"
              value={this.state.details}
              onChange={this.handleInputChange}
              required
            />
            <div className="break"></div>
            <input type="submit" value="Submit" className="hireButton" />
          </form>
        </div>
      </div>
    )
  }
}
