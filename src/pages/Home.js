import React from "react";
import {Link} from "react-router-dom";
import Page from "../Page";
import Icon from "../Icon";
import Select from "../Select";
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

    handleChange(val) {
        if (this.checkbox) {
            if (this.checkbox.checked) {
                window.electron.ipcRenderer.send("mount", this.props.site.id);
            } else {
                window.electron.ipcRenderer.send("unmount", this.props.site.id);
            }
        } else if (val === "None") {
            if (this.props.site.mount !== false) {
                window.electron.ipcRenderer.send("unmount", this.props.site.id);
            }
        } else if (this.props.site.mount === false) {
            window.electron.ipcRenderer.send("mount", this.props.site.id, val);
        } else if (this.props.site.mount !== val) {
            window.electron.ipcRenderer.send("unmount", this.props.site.id);
            window.electron.ipcRenderer.send("mount", this.props.site.id, val);
        }
        this.props.onChange();
    }

    render() {
        console.log(window.process.platform === "win32");
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
                    {window.process.platform === "win32" ? (
                        <Select options={[
                            "None"
                        ].concat(this.props.letters)} value={this.props.site.mount || "None"} onChange={this.handleChange} />
                    ) : (
                        <div className="switch">
                            <label>
                                Off
                                <input type="checkbox" checked={this.props.site.mount !== false} onChange={this.handleChange} ref={el => this.checkbox = el} />
                                <span className="lever"></span>
                                On
                            </label>
                        </div>
                    )}
                </div>
                <div className="btn-floating btn-small red close-btn" onClick={this.handleDelete}>
                    <Icon name="close" />
                </div>
            </div>
        );
    }
}

const letters = [
    "C:", "D:", "F:", "G:", "H:", "I:", "J:", "K:", "L:", "M:", "N:", "O:", "P:", "Q:", "R:", "S:", "T:", "U:", "V:", "W:", "X:", "Y:", "Z:"
];

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "sites": [],
            "letters": []
        };
        this.handleChange = this.handleChange.bind(this);
        setTimeout(this.handleChange);
    }

    handleChange() {
        if (window.process.platform === "win32") {
            setTimeout(() => this.setState({
                "sites": window.electronSettings.get("sites", []),
                "letters": letters.filter(l => !window.fs.existsSync(l))
            }), 100);
        } else {
            setTimeout(() => this.setState({
                "sites": window.electronSettings.get("sites", [])
            }), 100);
        }
    }
    
    componentDidMount() {
        window.electron.ipcRenderer.on("update", this.handleChange);
        if (window.process.platform === "win32") {
            this.iid = setInterval(this.handleChange, 5000);
        }
    }

    componentWillUnmount() {
        window.electron.ipcRenderer.removeListener("update", this.handleChange);
        if (window.process.platform === "win32") {
            clearInterval(this.iid);
        }
    }

    render() {
        return (
            <Page className="home" title="WebDAV Client" fab={(
                <Link className="btn-floating btn-floating-fixed btn-large red" to="add">
                    <Icon name="add" />
                </Link>
            )}>
                {this.state.sites.map(site => <Connection key={`key-${site.id}`} site={site} letters={this.state.letters} onChange={this.handleChange} />)}
            </Page>
        );
    }
}
