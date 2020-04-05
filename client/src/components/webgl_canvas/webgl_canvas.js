import React from 'react';

import Renderer from '../webgl/renderer.js'

import { } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import './webgl_canvas.css'


export default class WebGLCanvas extends React.Component {
    constructor(props) {
        super(props);

        this.container_ref = React.createRef();
        this.canvas_ref = React.createRef();
    }

    componentDidMount() {    
        // Start the WebGL instance
        const gl_context = this.canvas_ref.current.getContext("webgl", { preserveDrawingBuffer: true });

        if (gl_context === null) {
            alert("Unable to initialise WebGL. Your browser or machine may not support it."); 
        }
    
        this.canvas_ref.current.requestPointerLock = this.canvas_ref.current.requestPointerLock || this.canvas_ref.current.mozRequestPointerLock;
        this.canvas_ref.current.onclick = () => this.canvas_ref.current.requestPointerLock();
    
        this.resize_canvas(gl_context);
        window.addEventListener('resize', () => this.resize_canvas(gl_context));

        // Render
        this.renderer = new Renderer(this.canvas_ref.current, gl_context, this.props.update);
        this.renderer.set_fractal(this.props.fractal);
        this.renderer.render_loop();
    }

    componentDidUpdate() {
        this.renderer.set_fractal(this.props.fractal);
        this.renderer.set_colouring(this.props.colouring);
        this.renderer.time = this.props.time;
    }

    resize_canvas(context) {
        this.canvas_ref.current.width = this.container_ref.current.offsetWidth;
        this.canvas_ref.current.height = this.container_ref.current.offsetHeight;

        context.viewport(0, 0, this.container_ref.current.offsetWidth, this.container_ref.current.offsetHeight)
    }

    render() {
        return (
            <div id="canvas-container" ref={this.container_ref}>
                <canvas ref={this.canvas_ref} id="webgl_canvas" height="500" width="500" />
            </div>
        );
    }
}