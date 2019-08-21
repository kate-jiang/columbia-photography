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
          jobName: resJson.jobName,
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

  render() {
    return (
      <div className="hire">
        <div className="jobOptions">
          <button onClick={this.invoice}>Invoice</button>
          <button onClick={this.sendPortfolios}>Send Portfolios</button>
        </div>
      </div>
    )
  }
}
