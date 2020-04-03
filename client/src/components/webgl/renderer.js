import Camera from './camera'
import Program from './shader_program'
import Square from './renderables/square'


export default class Renderer {
    constructor(canvas_element, gl_context) {
        this.canvas = canvas_element;
        this.gl = gl_context;
        this.program = new Program(this.gl);

        this.image = new Square(this.gl);
        this.start_time = (new Date()).getTime();

        this.camera = new Camera();
    }

    // Rendering
    render_loop() {
        this.pre_render();
        this.render();
        window.setTimeout(() => this.render_loop(), 1000 / 60);

        this.camera.update();
    }

    pre_render() {
        const viewport_width = this.gl.getParameter(this.gl.VIEWPORT)[2];
        const viewport_height = this.gl.getParameter(this.gl.VIEWPORT)[3];

        let rgba = new Uint8Array(4);
        this.gl.readPixels(viewport_width / 2, viewport_height / 2, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);
        const d = Math.sqrt(Math.pow(rgba[0], 2) + Math.pow(rgba[1], 2) + Math.pow(rgba[2], 2));
        const speed_modifier = d / 442;
        this.camera.set_speed(speed_modifier);
        
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    render() {
        const time_delta = ((new Date()).getTime() - this.start_time) / 1000;

        this.gl.useProgram(this.program.program);

        this.gl.uniform2fv(this.program.uniforms.resolution, [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight]);
        this.gl.uniform1f(this.program.uniforms.time, time_delta);
        this.gl.uniform3fv(this.program.uniforms.eye, this.camera.position);
        this.gl.uniform3fv(this.program.uniforms.look_point, this.camera.get_looking_at_point());

        this.image.render(this.program);
    }
}