import React, { Component } from 'react'

interface IProps {
  width: number;
  height: number;
  background: string;
  children: React.ReactNode;
}

class Container extends Component<any> {
  render() {
    const { children, style } = this.props

    return (
      <div id="container" style={style}>{children}</div>
    )
  }
}

export default Container