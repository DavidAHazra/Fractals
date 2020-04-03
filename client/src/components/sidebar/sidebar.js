import React from 'react';

import { Menu, Header } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import './sidebar.css'


export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            
        };
    }

    render() {
        return (
            <Menu vertical id="sidebar-menu" >
                <Menu.Header as={Header} content="Fractal Explorer" textAlign="center" size="large" />
            </Menu>
        );
    }
}