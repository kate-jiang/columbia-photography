import React, { Component } from "react";

export default class JobWorkflow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approved: false,
      invoiceSent: false,
      portfoliosSent: false,
      releaseSent: false,
      jobName: "",
      photographers: []
    }
  }

  componentDidMount() {
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
          clientName: resJson.clientName,
          clientEmail: resJson.clientEmail,
          clientPhone: resJson.clientPhone,
          jobName: resJson.jobName,
          date: resJson.date,
          location: resJson.location,
          time: resJson.time,
          totalAmount: resJson.totalAmount,
          photographers: resJson.photographers,
          approved: resJson.approved,
          invoiceSent: resJson.invoiceSent,
          portfoliosSent: resJson.portfoliosSent,
          releaseSent: resJson.releaseSent
        })
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });

    fetch("/api/jobs/" + this.props.match.params.jobId + "/availablePhotographers")
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .then(resJson => {
        this.setState({photographers: resJson})
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  }

  invoice = () => {
    fetch("/api/invoice", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.setState({ invoiceSent: true });
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

  sendPortfolios = () => {
    fetch("/api/sendPortfolios", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.setState({ portfoliosSent: true });
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

  sendRelease = () => {
    fetch("/api/sendRelease", {
      method: "POST",
      body: JSON.stringify({ jobId: this.props.match.params.jobId }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.setState({ releaseSent: true });
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

  render() {
    return (
      <div className="hire">
        <div className="manage">
          <div className="clientInfo">
            <ul className="jobDetails">
              <li><h2>Job Details</h2></li>
              <li><strong>Name:</strong> {this.state.jobName}</li>
              <li><strong>Date:</strong> {this.state.date}</li>
              <li><strong>Time:</strong> {this.state.time}</li>
              <li><strong>Location:</strong> {this.state.location}</li>
              <li><strong>Total Amount:</strong> ${this.state.totalAmount}</li>
            </ul>
          </div>
          <div className="clientInfo">
            <ul className="jobDetails">
            <li><h2>Client Info</h2></li>
            <li><strong>Name:</strong> {this.state.clientName}</li>
            <li><strong>Email:</strong> {this.state.clientEmail}</li>
            <li><strong>Phone:</strong> {this.state.clientPhone}</li>
            </ul>
          </div>
        </div>
        <div className="manage">
          <div className="clientInfo">
          <ul className="jobDetails">
            <strong>Available Photographers:</strong> {this.state.photographers.join(', ')}
          </ul>
          </div>
        </div>
        <div className="workflowContainer">
          <div className="column">
            <div className="status">Invoice { this.state.invoiceSent ? '✅' : '❌'}</div>
            <button onClick={this.invoice}>Send Invoice</button>
          </div>
          <div className="column">
            <div className="status">Portfolios { this.state.portfoliosSent ? '✅' : '❌'}</div>
            <button onClick={this.sendPortfolios}>Send Portfolios</button>
          </div>
          <div className="column">
            <div className="status">Release { this.state.releaseSent ? '✅' : '❌'}</div>
            <button onClick={this.sendRelease}>Send Release</button>
          </div>
        </div>
      </div>
    )
  }
}
