import React, { Component } from "react";
import JobPreview from "./JobPreview";

export default class Jobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: []
    }
  }

  componentDidMount () {
    fetch("/api/jobs")
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
          jobs: resJson
        })
      })
  }

  render() {
    return (
      <div className="jobs">
        {this.state.jobs.map(job => <JobPreview job={job} uni={this.props.uni} key={job._id} />)}
      </div>
    )
  }
}
