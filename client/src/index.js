import React from 'react';
import ReactDOM from 'react-dom';

import { Container } from 'semantic-ui-react'

import Sidebar from './components/sidebar/sidebar'
import WebGLCanvas from './components/webgl_canvas/webgl_canvas'





class PageContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            current_fractal: "Mandlebulb"
        };
    }

    render() {
        return (
            <Container fluid style={{ display: "flex" }}>
                <Sidebar 
                    on_fractal_change={value => {
                        this.setState({ current_fractal: value })
                    }}
                />

                <WebGLCanvas fractal={this.state.current_fractal} />
            </Container>
        );
    }
}

// Render the PageContent
ReactDOM.render(<PageContent />, document.getElementById('root'));
