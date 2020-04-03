import React from 'react';

import { Menu, Header, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import './sidebar.css'

const fractal_dropdown_options = [
    {
        text: "Mandlebulb",
        value: "Mandlebulb"
    },

    {
        text: "Sierpinski's Tetrahedron",
        value: "Sierpinski"
    }
];


export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fractal_value: fractal_dropdown_options[0].value
        };
    }

    render() {
        return (
            <Menu vertical size="huge" id="sidebar-menu" >
                <Menu.Item>
                    <Menu.Header>Fractal Explorer</Menu.Header>
                </Menu.Item>

                <Menu.Item>
                    <Header content="Fractal" />
                    <Dropdown 
                        fluid
                        selection
                        search
                        options={fractal_dropdown_options}
                        value={this.state.fractal_value}
                        onChange={(_, { value }) => { 
                            this.setState({ fractal_value: value });
                            this.props.on_fractal_change(value);
                        }}
                    />
                </Menu.Item>
            </Menu>
        );
    }
}