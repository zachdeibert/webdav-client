import React from "react";
import {Link} from "react-router-dom";
import Page from "../Page";

export default class Add extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        window.electron.ipcRenderer.send("connect", this.url.value);
        return false;
    }
    
    render() {
        return (
            <Page className="add-page" title="Connect Site">
                <div className="row">
                    <form className="col s12" onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="input-field col s12">
                                <input placeholder="https://example.com/" name="url" type="url" ref={el => this.url = el} />
                                <label htmlFor="url" className="active">
                                    Site URL
                                </label>
                            </div>
                            <div className="col s12">
                                <div className="right">
                                    <Link className="btn btn-flat" to="/">
                                        Cancel
                                    </Link>
                                    <button type="submit" className="btn btn-flat">
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </Page>
        )
    }
}
