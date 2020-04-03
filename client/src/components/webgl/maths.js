// MISC
export function deg_to_rad(degrees) {
    return degrees * Math.PI / 180;
}

// VECTOR
export function add_vec3(vec1, vec2) {
    let new_vector = new Vector3(vec1[0], vec1[1], vec1[2]);
    
    for (let index = 0; index < vec2.length; ++index) {
        new_vector[index] += vec2[index];
    }
    
    return new_vector;
}

function subtract_vec3(vec1, vec2) {
    return add_vec3(vec1, mult_vec3(vec2, -1));
}

export function mult_vec3(vector, scalar) {
    let new_vector = new Vector3(vector[0], vector[1], vector[2]);
    
    for (let index = 0; index < vector.length; ++index) {
        new_vector[index] *= scalar;
    }
    
    return new_vector;
}

export function normalize_vec3(vector) {
    const vector_length = vector.vector_length();
    return new Vector3(
        vector[0] / vector_length,
        vector[1] / vector_length,
        vector[2] / vector_length
    );
}

export function cross_vec3(vec1, vec2) {
    return new Vector3(
        vec1[1] * vec2[2] - vec2[1] * vec1[2],
        vec1[2] * vec2[0] - vec2[2] * vec1[0],
        vec1[0] * vec2[1] - vec2[0] * vec1[1]
    );
}

export class Vector3 extends Array {
    constructor(x, y, z) {
        super(x, y, z);
    }

    vector_length() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2])
    }
}