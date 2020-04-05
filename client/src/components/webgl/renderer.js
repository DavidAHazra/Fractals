import Camera from './camera'
import Program from './shader_program'
import Square from './renderables/square'
import { Vector3 } from './maths';


const FPS = 60;

export default class Renderer {
    constructor(canvas_element, gl_context, update_function) {
        this.canvas = canvas_element;
        this.gl = gl_context;

        this.gui_update = update_function;

        this.program = new Program(this.gl);
        this.image = new Square(this.gl);
        this.camera = new Camera();
        this.time = 0;
    }

    set_fractal(fractal_name) {
        const previous_fractal = this.fractal_index;

        this.fractal_index = [
            "Mandlebox",
            "Mandlebulb",
            "Sierpinski",
            "Tree"

        ].indexOf(fractal_name);

        if (previous_fractal !== this.fractal_index) {
            this.camera.pitch = -30;
            this.camera.yaw = 225;

            switch (this.fractal_index) {
                case 0:
                    this.camera.position = new Vector3(8, 7, 8);
                    this.camera.min_speed = 0.001;
                    break;

                case 1:
                    this.camera.position = new Vector3(2, 2, 2);
                    break;

                case 2:
                    this.camera.position = new Vector3(2, 2, 2);
                    break;

                case 3:
                    this.camera.position = new Vector3(10, 10, 10);
                    break;
            
                default:
                    break;
            }
        }
    }

    set_colouring(colouring_name) {
        this.colouring_index = [
            "Orbit",
            "Point",
            "Steps",
            "Phong"
        ].indexOf(colouring_name);
    }

    // Rendering
    render_loop() {
        this.pre_render();
        this.render();
        window.setTimeout(() => this.render_loop(), 1000 / FPS);
    }

    pre_render() {
        const viewport_width = this.gl.getParameter(this.gl.VIEWPORT)[2];
        const viewport_height = this.gl.getParameter(this.gl.VIEWPORT)[3];

        let rgba = new Uint8Array(4);
        this.gl.readPixels(viewport_width / 2, viewport_height / 2, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);
        const distance = (rgba[0] + 10 * rgba[1] + 100 * rgba[2]) / (3 * 255);
        this.camera.set_speed(distance);
        
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.camera.update();

        this.gui_update([
            this.camera.position,
            this.camera.speed
        ]);
    }

    render() {
        this.gl.useProgram(this.program.program);

        this.gl.uniform2fv(this.program.uniforms.resolution, [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight]);
        this.gl.uniform1f(this.program.uniforms.time, this.time);
        this.gl.uniform3fv(this.program.uniforms.eye, this.camera.position);
        this.gl.uniform3fv(this.program.uniforms.look_point, this.camera.get_looking_at_point());
        this.gl.uniform1i(this.program.uniforms.fractal_index, this.fractal_index);
        this.gl.uniform1i(this.program.uniforms.colouring_index, this.colouring_index);

        this.image.render(this.program);
    }
}