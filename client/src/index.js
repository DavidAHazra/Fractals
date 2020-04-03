import React from 'react';
import ReactDOM from 'react-dom';

import { Container } from 'semantic-ui-react'

import Sidebar from './components/sidebar/sidebar'
import WebGLCanvas from './components/webgl_canvas/webgl_canvas'

class PageContent extends React.Component {
    render() {
        return (
            <Container fluid style={{ display: "flex" }}>
                <Sidebar />
                <WebGLCanvas />
                
            </Container>
        );
    }
}

// Render the PageContent
ReactDOM.render(<PageContent />, document.getElementById('root'));
