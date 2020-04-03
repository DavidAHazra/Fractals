export default class Square {
    constructor(gl_context) {
        this.gl = gl_context;

        const width = 1;
        const height = width;

        this.positions = [
            // x, y
            -width,  height,
            width,  height,
            -width, -height,

            -width, -height,
            width,  height,
            width, -height
        ];

        this.buffers = this._init_buffers();
    }

    render(program) {
        const coordinate_components = 2;
        const type = this.gl.FLOAT;
        const normalise = false;
        const stride = 0;
        const offset = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers);
        this.gl.vertexAttribPointer(
            program.attributes.vertex_position,
            coordinate_components,
            type,
            normalise,
            stride,
            offset
        );

        this.gl.enableVertexAttribArray(program.attributes.vertex_position);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    _init_buffers() {
        const position_buffer = this.gl.createBuffer();
      
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, position_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
      
        return position_buffer;
    }
}