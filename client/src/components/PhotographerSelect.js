import React, { Component } from "react";


export default class HireForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photographers: [],
      redirect: false,
      selectedPhotographer: ""
    }
  }

  componentDidMount() {
    fetch("/api/checkClient")
      .then(res => {
        if (res.status === 200) {
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
    this.setState({
      selectedPhotographer: event.target.value
    });
  };

  submit = () => {
    fetch("/api/selectPhotographer", {
      method: "POST",
      body: JSON.stringify({
        jobId: this.props.match.params.jobId,
        selectedPhotographer: this.state.selectedPhotographer
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.props.history.push("/confirm");
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error selecting photographer. Please email columbia-photography@columbia.edu for assistance.");
    });
  }

  render() {
    return (
      <div className="container">
        <div className="selectPhotographer">
          <div className="hireTitle">SELECT PHOTOGRAPHER</div>
          <ul>
            {this.state.photographers.map(photographer => {
              return (
                <li><input type="radio"
                           value={photographer.uni}
                           checked={this.state.selectedPhotographer === photographer.uni}
                           onChange={this.handleInputChange} /> {photographer.firstName} {photographer.lastName}
                </li>
              )
            })}
          </ul>
          <div className="break"></div>
          <button onClick={this.submit}>Submit</button>
        </div>
      </div>
    )
  }
}
