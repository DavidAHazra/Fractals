import React from 'react';
import ReactDOM from 'react-dom';

import { Container } from 'semantic-ui-react'

import Sidebar from './components/sidebar/sidebar'
import WebGLCanvas from './components/webgl_canvas/webgl_canvas'


import './index.css'


class PageContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            current_fractal: "Mandlebox",
            current_colouring: "Steps",
            camera_position: [0, 0, 0],
            camera_speed: 0,
            time: 0
        };
    }

    render() {
        return (
            <Container fluid id="page-container">
                <Sidebar 
                    on_fractal_change={value => this.setState({ current_fractal: value })}
                    on_colouring_change={value => this.setState({ current_colouring: value })}

                    set_time={time => this.setState({ time: time })}
                    camera_position={this.state.camera_position}
                    camera_speed={this.state.camera_speed}
                />

                <WebGLCanvas 
                    fractal={this.state.current_fractal}
                    colouring={this.state.current_colouring}
                    time={this.state.time}

                    update={data => this.setState({
                        camera_position: data[0],
                        camera_speed: data[1]
                    })}
                />
            </Container>
        );
    }
}

// Render the PageContent
ReactDOM.render(<PageContent />, document.getElementById('root'));
