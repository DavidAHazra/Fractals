precision highp int;
precision highp float;

// =========================
// ======= UNIFORMS ========
// =========================

uniform vec2 iResolution;
uniform float iTime;

uniform vec3 eye_position;
uniform vec3 look_point;
uniform int fractal_index;


// =========================
// ======= CONSTANTS =======
// =========================
#define MAX_STEPS 1000
#define MIN_DISTANCE 0.0
#define MAX_DISTANCE 9999999.0
#define EPSILON 0.0001
#define PI 3.1415926535

mat4 inverse_mat4(mat4 m) {
    float
    a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
    a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
    a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
    a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

    b00 = a00 * a11 - a01 * a10,
    b01 = a00 * a12 - a02 * a10,
    b02 = a00 * a13 - a03 * a10,
    b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11,
    b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30,
    b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30,
    b09 = a21 * a32 - a22 * a31,
    b10 = a21 * a33 - a23 * a31,
    b11 = a22 * a33 - a23 * a32,

    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return mat4(
        a11 * b11 - a12 * b10 + a13 * b09,
        a02 * b10 - a01 * b11 - a03 * b09,
        a31 * b05 - a32 * b04 + a33 * b03,
        a22 * b04 - a21 * b05 - a23 * b03,
        a12 * b08 - a10 * b11 - a13 * b07,
        a00 * b11 - a02 * b08 + a03 * b07,
        a32 * b02 - a30 * b05 - a33 * b01,
        a20 * b05 - a22 * b02 + a23 * b01,
        a10 * b10 - a11 * b08 + a13 * b06,
        a01 * b08 - a00 * b10 - a03 * b06,
        a30 * b04 - a31 * b02 + a33 * b00,
        a21 * b02 - a20 * b04 - a23 * b00,
        a11 * b07 - a10 * b09 - a12 * b06,
        a00 * b09 - a01 * b07 + a02 * b06,
        a31 * b01 - a30 * b03 - a32 * b00,
        a20 * b03 - a21 * b01 + a22 * b00
    ) / det;
}


vec3 custom_modulus(vec3 vector, float operator) {
    return vector - operator * floor(vector / operator);
}

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float atan2(float y, float x) {
    if (x > 0.0) {
        return atan(y / x);
    }

    if (x < 0.0 && y >= 0.0) {
        return atan(y / x) + PI;
    }

    if (x < 0.0 && y < 0.0) {
        return atan(y / x) - PI;
    }

    if (x == 0.0 && y > 0.0) {
        return PI / 2.0;
    }

    if (x == 0.0 && y < 0.0) {
        return -PI / 2.0;
    }

    return 0.0;
}

// =========================
// ===== SCENE DETAILS =====
// =========================
// Transformation Matrices
mat4 rotate_x(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, c, -s, 0.0,
        0.0, s, c, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

mat4 rotate_y(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat4(
        c, 0.0, s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

mat4 rotate_z(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat4(
        c, -s, 0.0, 0.0,
        s, c, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

// Combining Functions
float sdf_intersect(float distA, float distB) {
    return max(distA, distB);
}

float sdf_union(float distA, float distB) {
    return min(distA, distB);
}

float sdf_difference(float distA, float distB) {
    return max(distA, -distB);
}

// Space Folding
void planeFold(inout vec4 z, vec3 n, float d) {
	z.xyz -= 2.0 * min(0.0, dot(z.xyz, n) - d) * n;
}
void absFold(inout vec4 z, vec3 c) {
	z.xyz = abs(z.xyz - c) + c;
}
void sierpinskiFold(inout vec4 z) {
	z.xy -= min(z.x + z.y, 0.0);
	z.xz -= min(z.x + z.z, 0.0);
	z.yz -= min(z.y + z.z, 0.0);
}

void mengerFold(inout vec4 z) {
	float a = min(z.x - z.y, 0.0);
	z.x -= a;
	z.y += a;
	a = min(z.x - z.z, 0.0);
	z.x -= a;
	z.z += a;
	a = min(z.y - z.z, 0.0);
	z.y -= a;
	z.z += a;
}

void sphereFold(inout vec4 z, float minR, float maxR) {
	float r2 = dot(z.xyz, z.xyz);
	z *= max(maxR / max(minR, r2), 1.0);
}
void boxFold(inout vec4 z, vec3 r) {
	z.xyz = clamp(z.xyz, -r, r) * 2.0 - z.xyz;
}
void rotX(inout vec4 z, float s, float c) {
	z.yz = vec2(c*z.y + s*z.z, c*z.z - s*z.y);
}
void rotY(inout vec4 z, float s, float c) {
	z.xz = vec2(c*z.x - s*z.z, c*z.z + s*z.x);
}
void rotZ(inout vec4 z, float s, float c) {
	z.xy = vec2(c*z.x + s*z.y, c*z.y - s*z.x);
}
void rotX(inout vec4 z, float a) {
	rotX(z, sin(a), cos(a));
}
void rotY(inout vec4 z, float a) {
	rotY(z, sin(a), cos(a));
}
void rotZ(inout vec4 z, float a) {
	rotZ(z, sin(a), cos(a));
}


// Signed Distance Functions (SDFs)
float tetrahedron_sdf(vec4 p, float r) {
	float md = max(max(-p.x - p.y - p.z, p.x + p.y - p.z),
				   max(-p.x + p.y + p.z, p.x - p.y + p.z));

	return (md - r) / (p.w * sqrt(3.0));
}

float box_sdf(vec4 point, vec3 box_center, vec3 dimensions) {
    vec3 d = abs(point.xyz - box_center) - dimensions;
    
    float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDistance = length(max(d, 0.0));
    
    return (insideDistance + outsideDistance) / point.w;
}

float sphere_sdf(vec4 point, vec3 sphere_center, float radius) {
    return (length(point.xyz - sphere_center) - radius) / point.w;
}

// WORKING SDFs
vec4 tree_block(vec3 point) {
    float seed = 1024.3462;
    vec4 p = vec4(point, 1.0);
    float time = iTime / 2.0;

    float d = 1e20;
    vec3 orbit = vec3(1e20);
    
    for (int i = 0; i < 25; i++) {
        rotY(p, 0.44);
        absFold(p, vec3(0.0));
        mengerFold(p);

	    orbit = min(orbit, abs(p.xyz));

        p *= 1.3;
        p.xyz += vec3(-2.0, -4.8, 0.0);

        p.z = -abs(p.z);
    }

    float cube = min(d, box_sdf(p, vec3(0.0), vec3(4.8)));
    return vec4(orbit, cube);
}

vec4 sierpinski_tetrahedron(vec3 point) {
    vec4 p = vec4(point, 1.0);
    float time = iTime / 2.0;
    vec3 orbit = vec3(1e20);

    for (int i = 0; i < 20; ++i) {
        sierpinskiFold(p);

        orbit = min(orbit, abs(p.xyz));

        p *= 2.0;
        p.xyz -= vec3(1.0);
    }

    float tet = min(1e20, tetrahedron_sdf(p, 1.0));
    return vec4(abs(normalize(p.xyz)), tet);
}

vec4 mandlebulb(vec3 point) {
    vec3 orbit = vec3(1e20);



    vec3 z = point;
    float r = 0.0;

    float power = 10.0 * cos(iTime / 7.5) + 16.0;
    float dr = 1.0;
    float bailout = 2.0;

    int iterations = 0;
    for (int i = 0; i < 50; i++) {
        iterations = i;
        
        r = length(z);
        if (r > bailout){ break; }

        // Convert to polar
        float theta = acos(z.z / r);
        float phi = atan2(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        // Orbit
        orbit = min(orbit, abs(z));
        
        // Scale and rotate
        float zr = pow(r, power);
        theta *= power;
        phi *= power;

        z = zr * vec3(
                sin(theta) * cos(phi),
                sin(phi) * sin(theta),
                cos(theta)
            );

        z += point;
    }

    float d = 0.5 * log(r) * r / dr;
    return vec4(orbit, d);
}


vec4 scene_sdf(vec3 point) {
    // Returns vec4(colour, ..., ..., distance)

    // Translation: point += vec3(amount_x, amount_y, amount_z)
    // Scaling: sdf(point / scaling_factor) * scaling_factor
    // Rotation: new_point = (inverse_mat4(rotate_A(angle)) * vec4(point, 1.0)).xyz

    if (fractal_index == 0) {
        return mandlebulb(point);
        
    } else if (fractal_index == 1) {
        return sierpinski_tetrahedron(point);
    }
}

// Ray-March Algorithm
vec2 ray_march(vec3 eye, vec3 ray_direction) {
    // Returns vec2(distance, ray_steps_taken)

    float depth = MIN_DISTANCE;
    int ray_steps = 0;
    for (int i = 0; i < MAX_STEPS; ++i) {
        float dist = scene_sdf(eye + depth * ray_direction).w;

        if (dist < EPSILON) {
            return vec2(depth, float(ray_steps) / float(MAX_STEPS));
        }

        depth += dist;
        if (depth >= MAX_DISTANCE) {
            break;
        }

        ray_steps = i;
    }

    return vec2(MAX_DISTANCE, float(ray_steps) / float(MAX_STEPS));
}
            

vec3 get_ray_direction(float FOV) {
    vec2 xy = gl_FragCoord.xy - iResolution.xy / 2.0;
    float z = iResolution.y / tan(radians(FOV) / 2.0);
    return normalize(vec3(xy, -z));
}

// ==============================
// ====== LIGHTING & CAMERA =====
// ==============================
vec3 estimate_normal(vec3 p) {
    return normalize(vec3(
        scene_sdf(vec3(p.x + EPSILON, p.y, p.z)).w - scene_sdf(vec3(p.x - EPSILON, p.y, p.z)).w,
        scene_sdf(vec3(p.x, p.y + EPSILON, p.z)).w - scene_sdf(vec3(p.x, p.y - EPSILON, p.z)).w,
        scene_sdf(vec3(p.x, p.y, p.z  + EPSILON)).w - scene_sdf(vec3(p.x, p.y, p.z - EPSILON)).w
    ));
}

vec3 phong_for_light(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 light_position, vec3 light_intensity) {
    vec3 N = estimate_normal(p);
    vec3 L = normalize(light_position - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));
    
    float dotLN = dot(L, N);
    float dotRV = dot(R, V);
    
    if (dotLN < 0.0) {
        // Light not visible from this point on the surface
        return vec3(0.0);
    } 
    
    if (dotRV < 0.0) {
        // Light reflection in opposite direction as viewer, apply only diffuse component
        return light_intensity * k_d * dotLN;
    }

    return light_intensity * k_d * dotLN + k_s * pow(dotRV, alpha);
}

vec3 get_phong_for_scene(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
    const vec3 ambient = vec3(0.25);
    vec3 color = ambient * k_a;
    
    vec3 light_position = eye;
    vec3 light_intensity = vec3(0.4, 0.4, 0.4);
    color += phong_for_light(k_d, k_s, alpha, p, eye, light_position, light_intensity);
    
    return color;
}

mat4 get_view_matrix(vec3 eye, vec3 center, vec3 up) {
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);

    return mat4(
        vec4(s, 0.0),
        vec4(u, 0.0),
        vec4(-f, 0.0),
        vec4(0.0, 0.0, 0.0, 1)
    );
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec3 eye = eye_position;
    vec3 current_look_point = look_point;

    vec3 ray_direction = get_ray_direction(90.0);
    mat4 view_matrix = get_view_matrix(eye, current_look_point, vec3(0.0, 1.0, 0.0));    
    vec3 world_ray_direction = (view_matrix * vec4(ray_direction, 0.0)).xyz;
    
    vec2 ray_info = ray_march(eye, world_ray_direction);
    float dist = ray_info.x;

    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    if (distance(uv, vec2(0.5)) <= 0.001) {
        float DE_for_eye = scene_sdf(eye).w;

        gl_FragColor = vec4(DE_for_eye, DE_for_eye, DE_for_eye, 1.0);
        return;
    }

    if (dist > MAX_DISTANCE - EPSILON) {
        // Didn't hit anything - GLOW
        gl_FragColor = vec4(5.0 * vec3(ray_info.y), 1.0);
        return;
    }
    
    // The closest point on the surface to the eyepoint along the view ray
    vec3 point = eye + dist * world_ray_direction;

    //gl_FragColor = vec4(abs(normalize(point)), 1.0);
   // gl_FragColor = vec4(clamp(scene_sdf(point).xyz, 0.05, 0.95), 1.0);
   // return; 
    
    vec3 K_a = vec3(0.2, 0.2, 0.2);
    vec3 K_d = vec3(0.7, 0.2, 0.2);
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 10.0;
    
    vec3 color = get_phong_for_scene(K_a, K_d, K_s, shininess, point, eye);
    gl_FragColor = vec4(color, 1.0);
}
