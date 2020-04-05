import React from 'react';

import { Menu, Header, Dropdown, Input, Checkbox } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import './sidebar.css'

const fractal_dropdown_options = [
    {
        text: "Mandlebox",
        value: "Mandlebox"
    },

    {
        text: "Mandlebulb",
        value: "Mandlebulb"
    },

    {
        text: "Sierpinski's Tetrahedron",
        value: "Sierpinski"
    },

    {
        text: "Tree Island",
        value: "Tree"
    }
];

const colouring_dropdown_options = [
    {
        text: "Orbit Trap",
        value: "Orbit"
    },

    {
        text: "Point Position",
        value: "Point"
    },

    {
        text: "Ray Steps",
        value: "Steps"
    },

    {
        text: "Phong Shading",
        value: "Phong"
    }
];


export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fractal_value: fractal_dropdown_options[0].value,
            colouring_value: colouring_dropdown_options[0].value,
            range_value: 0,
            animate: true
        };

        this.range_step = 0.005;
        this.range_max = 100;

        setInterval(() => {
            if (!this.state.animate) { return; }
            if (Math.abs(parseFloat(this.state.range_value)) >= parseFloat(this.range_max)) { this.range_step = -parseFloat(this.range_step); }

            const new_time = (parseFloat(this.state.range_value) + parseFloat(this.range_step)).toFixed(2);

            this.setState({ range_value: new_time });
            this.props.set_time(new_time);

        }, 50);
    }

    render() {
        return (
            <Menu vertical size="huge" id="sidebar-menu" >
                <Menu.Item>
                    <Menu.Header>Fractal Explorer</Menu.Header>
                </Menu.Item>

                <Menu.Item>
                    <Header content="Camera" />
                    <Input label="x" value={this.props.camera_position[0]} />
                    <Input label="y" value={this.props.camera_position[1]} />
                    <Input label="z" value={this.props.camera_position[2]} />
                    <Input fluid label="Speed" value={this.props.camera_speed} />
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

                            if (value === "Mandlebox") {
                                this.setState({ colouring_value: "Steps" });
                            }
                        }}
                    />
                </Menu.Item>

                <Menu.Item>
                    <Header content="Colouring" />
                    <Dropdown 
                        fluid
                        selection
                        search
                        options={colouring_dropdown_options}
                        value={this.state.colouring_value}
                        onChange={(_, { value }) => {
                            this.setState({ colouring_value: value });
                            this.props.on_colouring_change(value);
                        }}
                    />
                </Menu.Item>

                <Menu.Item>
                    <Header content="Time" subheader={<Header.Subheader><b>Some</b> fractals can change with time.</Header.Subheader>} />

                    <small id="time-label">Time = {this.state.range_value}</small><br />
                    <Checkbox label="Change Automatically?" checked={this.state.animate} onChange={() => this.setState({ animate: !this.state.animate })} />
                    <input
                        type="range" 
                        value={this.state.range_value}

                        onChange={event => {
                            this.setState({ range_value: event.target.value })
                            this.props.set_time(event.target.value);
                        }}

                        min={-this.range_max}
                        max={this.range_max}
                        step={this.range_step}
                    />
                </Menu.Item>
            </Menu>
        );
    }
}