import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Confirmation extends Component {

  render() {
    return (
      <div className="container">
        <div className="confirmation">
          <div className="hireTitle">THANK YOU</div>
          { this.props.location.state.type === "hire" &&
            <>
              Your form submission has been received! A CPA representative will be in touch soon.
              <br/><br/>
              <Link to="/hire"><strong>Submit another job request.</strong></Link>
            </>
          }
          { this.props.location.state.type === "selectPhotographer" &&
            <>
              Your photographer selection has been received! A CPA representative will be in touch soon.
            </>
          }
        </div>
      </div>
    )
  }
}
