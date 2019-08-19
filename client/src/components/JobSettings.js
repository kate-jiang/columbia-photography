import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class JobSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      jobName: "",
      date: "",
      location: "",
      time: "",
      totalAmount: "",
      compensation: "",
      details: "",
      approved: false
    }
    this.originalValues = {};
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
        this.originalValues = resJson;
        this.setState({
          jobId: resJson._id,
          clientName: resJson.clientName,
          clientEmail: resJson.clientEmail,
          clientPhone: resJson.clientPhone,
          jobName: resJson.jobName,
          date: resJson.date,
          location: resJson.location,
          time: resJson.time,
          totalAmount: resJson.totalAmount,
          compensation: resJson.compensation,
          details: resJson.details,
          approved: resJson.approved
        });
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
    console.log(value);
  };

  handleSubmit = event => {
    event.preventDefault();
    fetch("/api/updateJob", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          console.log("success")
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

  approve = event => {
    event.preventDefault();
    fetch("/api/approveJob", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.setState({ approved: true })
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

  unapprove = event => {
    event.preventDefault();
    fetch("/api/unapproveJob", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.setState({ approved: false })
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

  undo = event => {
    event.preventDefault();
    this.setState({
      jobName: this.originalValues.jobName,
      date: this.originalValues.date,
      location: this.originalValues.location,
      time: this.originalValues.time,
      totalAmount: this.originalValues.totalAmount,
      compensation: this.originalValues.compensation,
      details: this.originalValues.details
    })
  }

  render() {
    return (
      <div className="hire">
      <div className="clientInfo">
        <ul className="jobDetails">
          <li><h2>Client Info</h2></li>
          <li><strong>Name:</strong> {this.state.clientName}</li>
          <li><strong>Email:</strong> {this.state.clientEmail}</li>
          <li><strong>Phone:</strong> {this.state.clientPhone}</li>
        </ul>
      </div>
      <div className="break"></div>
        <form className="hireForm" onSubmit={this.handleSubmit}>
          <div className="hireInputWrap">
            <div className="hireInputLabel">Job Name</div>
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
          </div>
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
            <div className="hireInputLabel">Time</div>
            <div className="break"></div>
            <input
              type="text"
              name="time"
              className="hireInput"
              value={this.state.time}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="break"></div>
          <div className="hireInputWrap">
            <div className="hireInputLabel">Location</div>
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
          </div>
          <div className="hireInputWrap">
            <div className="hireInputLabel">Details</div>
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
          </div>
          <div className="break"></div>
          <div className="hireInputWrap">
            <div className="hireInputLabel">Total Amount</div>
            <div className="break"></div>
            <input
              type="text"
              name="totalAmount"
              placeholder="Total Amount"
              className="hireInput"
              value={this.state.totalAmount}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="hireInputWrap">
            <div className="hireInputLabel">Compensation</div>
            <div className="break"></div>
            <input
              type="text"
              name="compensation"
              placeholder="Compensation"
              className="hireInput"
              value={this.state.compensation}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="break"></div>
          <input type="submit" onClick={this.undo} value="Undo" className="undoButton" />
          {this.state.approved ? (
            <input type="submit" onClick={this.unapprove} value="Unapprove" className="submitButton" />
          ) : (
            <input type="submit" onClick={this.approve} value="Approve" className="submitButton" />
          )}
          <input type="submit" value="Save" className="submitButton" />
        </form>
      </div>
    )
  }
}
