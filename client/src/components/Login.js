import React, { Component } from "react";
import "../css/styles.css";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uni: "",
      password: "",
      redirect: "/"
    };
  }

  componentDidMount() {
    const url = new URL(window.location)
    const redirect = url.searchParams.get("redirect");
    if (redirect) {
      this.setState({redirect: decodeURIComponent(redirect)})
    }

    fetch("/api/checkToken")
      .then(res => {
        if (res.status === 200) {
          this.props.history.push(this.state.redirect);
        };
      });
  }

  handleInputChange = event => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  };

  onSubmit = event => {
    event.preventDefault();
    fetch("/api/authenticate", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          this.props.history.push(this.state.redirect);
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error logging in.");
      });
  };

  render() {
    return (
      <div className="auth-wrap">
        <div className="auth">
          <form onSubmit={this.onSubmit}>
            <h1>COLUMBIA PHOTOGRAPHY ASSOCIATION</h1>
            <div className="auth-content-wrap">
              <input
                type="text"
                name="uni"
                placeholder="UNI"
                className="auth-input"
                value={this.state.uni}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <div className="auth-content-wrap">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="auth-input"
                value={this.state.password}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <div className="auth-content-wrap">
              <input type="submit" value="Login" className="auth-button" />
            </div>
          </form>
        </div>
      </div>
    );
  }
}
