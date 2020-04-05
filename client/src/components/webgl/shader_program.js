function get_file(path) {
    let request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send();
    return request.responseText;
}


export default class Program {
    constructor(gl) {
        this.gl = gl;

        const _vertex_source = get_file('/shaders/standard.vert');
        const _fragment_source = get_file('/shaders/standard.frag');
        this.program = this._create_program(_vertex_source, _fragment_source);

        this.attributes = {
            vertex_position: this.gl.getAttribLocation(this.program, 'vertex_position')    
        };

        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'iResolution'),
            time: this.gl.getUniformLocation(this.program, 'iTime'),
            eye: this.gl.getUniformLocation(this.program, 'eye_position'),
            look_point: this.gl.getUniformLocation(this.program, 'look_point'),
            fractal_index: this.gl.getUniformLocation(this.program, 'fractal_index'),
            colouring_index: this.gl.getUniformLocation(this.program, 'colouring_index')
        };
    }

    // ============================
    // ===== Helper Functions =====
    // ============================

    _create_program(vertex_source, fragment_source) {
        const vertex_shader = this._load_shader(this.gl.VERTEX_SHADER, vertex_source);
        const fragment_shader = this._load_shader(this.gl.FRAGMENT_SHADER, fragment_source);
    
        const shader_program = this.gl.createProgram();
        this.gl.attachShader(shader_program, vertex_shader);
        this.gl.attachShader(shader_program, fragment_shader);
        this.gl.linkProgram(shader_program);
    
        if (!this.gl.getProgramParameter(shader_program, this.gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shader_program);
        }
        
        return shader_program;        
    }

    _load_shader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
    
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw 'An error occurred compiling the shaders: ' + source + this.gl.getShaderInfoLog(shader);
        }
    
        return shader;
    }
}
