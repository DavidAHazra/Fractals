import React from 'react';

import { Menu, Header, Dropdown, Input, Checkbox, Accordion } from 'semantic-ui-react'
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
        text: "Menger Cube",
        value: "Menger"
    },

    {
        text: "Big Blob",
        value: "Snow"
    },

    {
        text: "Sierpinski's Tetrahedron",
        value: "Sierpinski"
    },

    {
        text: "Tree Island",
        value: "Tree"
    }, 

    {
        text: "Infinite Spheres",
        value: "InfSphere"
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
            colouring_value: colouring_dropdown_options[2].value,
            range_value: 0,
            animate: true,
            
            camera_tab_open: false,
            fractal_tab_open: true,
            colouring_tab_open: true,
            time_tab_open: false,
            thanks_to_tab_open: false
        };

        this.range_step = 0.01;
        this.range_max = 100;

        setInterval(() => {
            if (!this.state.animate) { return; }
            if (Math.abs(parseFloat(this.state.range_value)) >= parseFloat(this.range_max)) { this.range_step = -parseFloat(this.range_step); }

            const new_time = (parseFloat(this.state.range_value) + parseFloat(this.range_step)).toFixed(2);

            this.setState({ range_value: new_time });
            this.props.set_time(new_time);
        }, 10);
    }

    render() {
        return (
            <Menu vertical size="huge" id="sidebar-menu" >
                <Menu.Item>
                    <Menu.Header>Fractal Explorer</Menu.Header>
                    <p>Made by <a href="www.davidhazra.com">David Hazra</a>.</p>
                    <small>Check out my <a href="https://github.com/DavidAHazra">GitHub</a> for the source!</small>
                    <small>This activity is only suitable on a computer.</small>
                </Menu.Item>

                <Menu.Item>
                    <Accordion>
                        <Accordion.Title 
                            content="Camera" 
                            onClick={() => this.setState({ camera_tab_open: !this.state.camera_tab_open })}
                            active={this.state.camera_tab_open} 
                        />


                        <Accordion.Content active={this.state.camera_tab_open}>
                            <Input label="x" value={this.props.camera_position[0]} />
                            <Input label="y" value={this.props.camera_position[1]} />
                            <Input label="z" value={this.props.camera_position[2]} />
                            <Input fluid label="Speed" value={this.props.camera_speed} />
                        </Accordion.Content>
                    </Accordion>
                </Menu.Item>

                <Menu.Item>
                    <Accordion>
                        <Accordion.Title 
                            content="Fractal"
                            onClick={() => this.setState({ fractal_tab_open: !this.state.fractal_tab_open })}
                            active={this.state.fractal_tab_open} 
                        />

                        <Accordion.Content active={this.state.fractal_tab_open}>
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
                                        this.props.on_colouring_change("Steps");

                                    } else if (["Mandlebulb", "Menger", "Sierpinski", "Tree", "InfSphere", "Snow"].includes(value)) {
                                        this.setState({ colouring_value: "Orbit" });
                                        this.props.on_colouring_change("Orbit");
                                    } 
                                }}
                            />

                            <small>Changing fractal also changes colouring (to what I think looks coolest), but you can still change the colouring.</small>
                        </Accordion.Content>
                    </Accordion>
                </Menu.Item>

                <Menu.Item>
                    <Accordion>
                        <Accordion.Title 
                            content="Colouring"
                            onClick={() => this.setState({ colouring_tab_open: !this.state.colouring_tab_open })}
                            active={this.state.colouring_tab_open} 
                        />

                        <Accordion.Content active={this.state.colouring_tab_open}>
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
                        </Accordion.Content>
                    </Accordion>
                </Menu.Item>

                <Menu.Item>
                    <Accordion>
                        <Accordion.Title 
                            content="Time"
                            onClick={() => this.setState({ time_tab_open: !this.state.time_tab_open })}
                            active={this.state.time_tab_open} 
                        />

                        <Accordion.Content active={this.state.time_tab_open}>
                            <small>Some fractals can change with time.</small>
                            <br /><br />

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
                        </Accordion.Content>
                    </Accordion>
                </Menu.Item>

                <Menu.Item>
                    <Accordion>
                        <Accordion.Title 
                            content="Thanks To"
                            onClick={() => this.setState({ thanks_to_tab_open: !this.state.thanks_to_tab_open })}
                            active={this.state.thanks_to_tab_open} 
                        />

                        <Accordion.Content active={this.state.thanks_to_tab_open}>
                            <small><a href="https://www.youtube.com/channel/UCrv269YwJzuZL3dH5PCgxUw" target="_blank">CodeParade</a> for the inspiration, and some cool designs (Tree Island especially!).</small>
                        </Accordion.Content>
                    </Accordion>


                </Menu.Item>
            </Menu>
        );
    }
}