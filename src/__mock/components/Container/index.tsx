import React, { Component } from 'react'

interface IProps {
  width: number;
  height: number;
  background: string;
  children: React.ReactNode;
}

class Container extends Component<IProps> {
  render() {
    const { children, width = '500px', height = '100px', background } = this.props
    return (
      <div id="container" style={{ width, height, background }}>{children}</div>
    )
  }
}

export default Container