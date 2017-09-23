import React from "react";
import "material-design-icons/iconfont/material-icons.css";

export default class Icon extends React.Component {
    render() {
        return (
            <i className="material-icons">
                {this.props.name}
            </i>
        );
    }
}
