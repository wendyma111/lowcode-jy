import React, { Component } from 'react'

interface IProps {
  color: string;
  fontSize: number;
}

class Text extends Component<IProps> {
  render() {
    const { color, fontSize } = this.props
    return (
      <span id="text" style={{ color, fontSize }}>texttext</span>
    )
  }
}

export default Text