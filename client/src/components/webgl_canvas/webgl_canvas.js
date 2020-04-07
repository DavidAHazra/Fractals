import React from 'react';

import Renderer from '../webgl/renderer.js'

import { Icon } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import './webgl_canvas.css'


export default class WebGLCanvas extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            finished_loading: false
        };

        this.container_ref = React.createRef();
        this.canvas_ref = React.createRef();
    }

    async componentDidMount() {    
        // Start the WebGL instance
        const gl_context = this.canvas_ref.current.getContext("webgl", { preserveDrawingBuffer: true });

        if (gl_context === null) {
            alert("Unable to initialise WebGL. Your browser or machine may not support it."); 
        }
    
        this.canvas_ref.current.requestPointerLock = this.canvas_ref.current.requestPointerLock || this.canvas_ref.current.mozRequestPointerLock;
        this.canvas_ref.current.onclick = () => this.canvas_ref.current.requestPointerLock();
    
        this.resize_canvas(gl_context);
        window.addEventListener('resize', () => this.resize_canvas(gl_context));

        // Renderer
        const start = (new Date()).getTime();

        const fragment_source = await (await fetch('/shaders/standard.frag')).text();
        const vertex_source = await (await fetch('/shaders/standard.vert')).text();

        this.renderer = new Renderer(this.canvas_ref.current, gl_context, vertex_source, fragment_source, this.props.update);
        this.renderer.set_fractal(this.props.fractal);
        this.renderer.render_loop();            
    
        this.setState({ finished_loading: true });
    }

    componentDidUpdate() {
        if (this.renderer !== undefined) {
            this.renderer.set_fractal(this.props.fractal);
            this.renderer.set_colouring(this.props.colouring);
            this.renderer.time = this.props.time;    
        }
    }

    resize_canvas(context) {
        this.canvas_ref.current.width = this.container_ref.current.offsetWidth;
        this.canvas_ref.current.height = this.container_ref.current.offsetHeight;

        context.viewport(0, 0, this.container_ref.current.offsetWidth, this.container_ref.current.offsetHeight)
    }

    render() {
        return (<>
           { this.state.finished_loading ? null : <Icon loading size="massive"/> }

            <div id="canvas-container" ref={this.container_ref}>
                <canvas ref={this.canvas_ref} id="webgl_canvas" height="500" width="500" />
            </div>
        </>);
    }
}