import React, { Component } from 'react'

interface IProps {
  style: Record<string, any>;
  text: string;
  onClick: () => void;
}

class Text extends Component<IProps> {
  render() {
    const { style, text, onClick } = this.props

    return (
      <div id="text" style={style} onClick={onClick}>
        <span>
          {`text: ${text}`}
        </span>
      </div>
    )
  }
}

export default Text