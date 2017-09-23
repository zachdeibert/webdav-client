import React from "react";
import {HashRouter, Switch, Route} from "react-router-dom";
import Add from "./pages/Add";
import Home from "./pages/Home";
import "./App.css";
import "materialize-css/dist/css/materialize.min.css";

export default class App extends React.Component {
    render() {
        return (
            <div className="blue lighten-5 app">
                <HashRouter>
                    <Switch>
                        <Route path="/add" component={Add} />
                        <Route component={Home} />
                    </Switch>
                </HashRouter>
            </div>
        );
    }
}
