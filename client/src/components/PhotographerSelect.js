import React, { Component } from "react";


export default class PhotographerSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photographers: [],
      redirect: false,
      selectedPhotographerUni: ""
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

  handleInputChange = event => {
    this.setState({
      selectedPhotographerUni: event.target.value
    });
    console.log(event.target.value)
  };

  submit = () => {
    fetch("/api/selectPhotographer", {
      method: "POST",
      body: JSON.stringify({
        jobId: this.props.match.params.jobId,
        selectedPhotographer: this.state.photographers.find(p => p.uni === this.state.selectedPhotographerUni)
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        this.props.history.push({
          pathname: "/confirm",
          state: { type: "selectPhotographer" }
        });
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
                           checked={this.state.selectedPhotographerUni === photographer.uni}
                           onChange={this.handleInputChange} />
                            {` ${photographer.firstName} ${photographer.lastName}`} (<a href={photographer.defaultPortfolio}>view portfolio</a>)
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
