import React from "react";
import "./Page.css";

export default class Page extends React.Component {
    componentDidMount() {
        document.title = this.props.title;
    }

    render() {
        return (
            <div className={`blue lighten-5 ${this.props.className}`}>
                <nav className="blue">
                    <div className="nav-wrapper">
                        <a className="brand-logo">
                            {this.props.title}
                        </a>
                    </div>
                </nav>
                <div className="container">
                    {this.props.children}
                </div>
                {this.props.fab}
            </div>
        );
    }
}
