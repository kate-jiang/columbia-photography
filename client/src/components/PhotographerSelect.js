import React, { Component } from "react";


export default class HireForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photographers: [],
      redirect: false
    }
  }

  componentDidMount() {
    fetch("/api/checkClient")
      .then(res => {
        if (res.status === 200) {
          res.redirect("/api/jobs/" + this.props.match.params.jobId + "/availablePhotographers");
        } else {
          this.props.history.push("/");
        }
      })
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
        this.props.history.push("/");
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
          <div className="hireTitle">Select Photographer</div>
        </div>
      </div>
    )
  }
}
