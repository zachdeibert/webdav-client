import React from "react";
import {Link} from "react-router-dom";
import Page from "../Page";
import Icon from "../Icon";
import "./Home.css";

class Connection extends React.Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleDelete() {
        window.electron.ipcRenderer.send("disconnect", this.props.site.id);
        this.props.onChange();
    }

    handleChange() {
        if (this.checkbox.checked) {
            window.electron.ipcRenderer.send("mount", this.props.site.id);
        } else {
            window.electron.ipcRenderer.send("unmount", this.props.site.id);
        }
        this.props.onChange();
    }

    render() {
        return (
            <div className="card">
                <div className="card-image">
                    <img src={this.props.site.icon} alt="" />
                    <span className="card-title">
                        {this.props.site.title}
                    </span>
                </div>
                <div className="card-content">
                    <p>
                        {this.props.site.url}
                    </p>
                    <div className="switch">
                        <label>
                            Off
                            <input type="checkbox" checked={this.props.site.mount !== false} onChange={this.handleChange} ref={el => this.checkbox = el} />
                            <span className="lever"></span>
                            On
                        </label>
                    </div>
                </div>
                <div className="btn-floating btn-small red close-btn" onClick={this.handleDelete}>
                    <Icon name="close" />
                </div>
            </div>
        );
    }
}

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "sites": []
        };
        this.handleChange = this.handleChange.bind(this);
        setTimeout(this.handleChange);
    }

    handleChange() {
        setTimeout(() => this.setState({
            "sites": window.electronSettings.get("sites", [])
        }), 100);
    }
    
    componentDidMount() {
        window.electron.ipcRenderer.on("update", this.handleChange);
    }

    componentWillUnmount() {
        window.electron.ipcRenderer.removeListener("update", this.handleChange);
    }

    render() {
        return (
            <Page className="home" title="WebDAV Client" fab={(
                <Link className="btn-floating btn-floating-fixed btn-large red" to="add">
                    <Icon name="add" />
                </Link>
            )}>
                {this.state.sites.map(site => <Connection key={`key-${site.id}`} site={site} onChange={this.handleChange} />)}
            </Page>
        );
    }
}
