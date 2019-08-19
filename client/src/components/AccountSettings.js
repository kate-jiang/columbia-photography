import React, { Component } from "react";

export default class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      defaultPortfolio: "",
      eventPortfolio: "",
      portraitPortfolio: "",
    };
    this.originalValues = {};
  }

  componentDidMount() {
    fetch("/api/getUser")
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
        console.log(this.originalValues);
        this.setState({
          firstName: resJson.firstName,
          lastName: resJson.lastName,
          defaultPortfolio: resJson.defaultPortfolio,
          eventPortfolio: resJson.eventPortfolio,
          portraitPortfolio: resJson.portraitPortfolio
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, redirect: true });
      });
  }

  handleSubmit = event => {
    event.preventDefault();
    fetch("/api/updateUser",  {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.props.history.push("/settings");
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error saving settings.");
    });
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
    console.log(value);
  };

  undo = event => {
    event.preventDefault();
    this.setState({
      firstName: this.originalValues.firstName,
      lastName: this.originalValues.lastName,
      defaultPortfolio: this.originalValues.defaultPortfolio,
      eventPortfolio: this.originalValues.eventPortfolio,
      portraitPortfolio: this.originalValues.portraitPortfolio
    });
  }

  render() {
    return (
      <div className="accountSettings">
        <div className="settingsTitle">SETTINGS</div>
        <div className="break"></div>
        <form className="settingsForm" onSubmit={this.handleSubmit}>
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
            type="text"
            name="defaultPortfolio"
            placeholder="Default Portfolio"
            className="hireInput"
            value={this.state.defaultPortfolio}
            onChange={this.handleInputChange}
            required
          />
          <div className="break"></div>
          <input
            type="text"
            name="eventPortfolio"
            placeholder="Event Portfolio"
            className="hireInput"
            value={this.state.eventPortfolio}
            onChange={this.handleInputChange}
            required
          />
          <div className="break"></div>
          <input
            type="text"
            name="portraitPortfolio"
            placeholder="Portrait Portfolio"
            className="hireInput"
            value={this.state.portraitPortfolio}
            onChange={this.handleInputChange}
            required
          />
          <div className="break"></div>
          <input type="button" onClick={this.undo} value="Undo" className="undoButton" />
          <input type="submit" value="Save" className="submitButton" />
        </form>
      </div>
    )
  }
}
