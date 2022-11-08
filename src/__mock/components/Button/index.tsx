import React, { Component } from 'react'

interface IProps {
  width: number;
  height: number;
  background: string;
  color: string;
  fontSize: number;
}

class Button extends Component<IProps> {
  render () {
    const { width, height, background, color, fontSize } = this.props
    return (<div style={{ 
      width,
      height,
      background,
      color,
      fontSize
     }}>Button</div>)
  }
}

export default Button