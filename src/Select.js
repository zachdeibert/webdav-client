import React from "react";
import Icon from "./Icon";
import "./Select.css";

export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "active": false,
            "value": this.props.value || this.props.options[0]
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(val) {
        if (typeof(val) === "string") {
            this.setState({
                "active": false,
                "value": val
            });
            if (this.props.onChange) {
                this.props.onChange(val);
            }
        } else {
            this.setState({
                "active": !this.state.active
            });
        }
    }

    render() {
        return (
            <div className={`input-field ${this.props.className}`}>
                <div className="select-wrapper">
                    <span className="caret" onClick={this.handleClick}>
                        <Icon name="expand_more" />
                    </span>
                    <input className={`select-dropdown ${this.state.active && "active"}`} readonly value={this.state.value} type="text" onClick={this.handleClick} />
                    <ul className={`dropdown-content select-dropdown ${this.state.active && "active"}`}>
                        {this.props.options.map((opt, i) => (
                            <li key={`option-${i}`} className={this.state.value === opt && "selected"} onClick={this.handleClick.bind(this, opt)}>
                                <span>
                                    {opt}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}
