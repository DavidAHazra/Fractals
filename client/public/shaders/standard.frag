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
uniform int colouring_index;

// =========================
// ======= CONSTANTS =======
// =========================
#define MAX_STEPS 250
#define MIN_DISTANCE 0.0
#define MAX_DISTANCE 1000.0
#define EPSILON 0.0001
#define PI 3.1415926535
const vec3 SUN_POSITION = vec3(0.0, 15.0, 0.0);


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

    for (int i = 0; i < 15; ++i) {
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
    for (int i = 0; i < 20; i++) {
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

vec4 mandlebox(vec3 point) {
    vec3 orbit = vec3(1e20);
    vec4 p = vec4(point, 1.0);

    for (int i = 0; i < 20; i++) {
        boxFold(p, vec3(1.0));
        sphereFold(p, 0.5, 1.0);

        p *= 2.0;
        p.w = abs(p.w);
        p.xyz += point;

        // Orbit
        orbit = min(orbit, abs(p.xyz));
    }

    float d = box_sdf(p, vec3(0.0), vec3(6.0));
    return vec4(orbit, d);
}


vec4 infinite_spheres(vec3 point) {
    vec3 orbit = vec3(1e20);
    vec4 p = vec4(point, 1.0);

    p.xyz = abs(mod(p.xyz, 2.0) - vec3(2.0));
    orbit = min(orbit, p.xyz);

    return vec4(orbit, sphere_sdf(p, vec3(1.0), 0.5));
}

vec4 menger_cube(vec3 point) {
    vec3 orbit = vec3(1e20);
    vec4 p = vec4(point, 1.0);

    for (int i = 0; i < 20; ++i) {
        p.xyz = abs(p.xyz);
        mengerFold(p);

        orbit = min(orbit, abs(p.xyz));

        p *= 3.0;
        p.xyz += vec3(-2.0, -2.0, 0.0);
        p.z = -abs(p.z - 1.0) + 1.0;
    }

    return vec4(orbit, box_sdf(p, vec3(0.0), vec3(2.0)));
}


vec4 snow_stadium(vec3 point) {
    vec3 orbit = vec3(1e20);
    vec4 p = vec4(point, 1.0);

    float angle = sin(iTime / 2.0);

    for (int i = 0; i < 20; ++i) {
        rotY(p, -angle);
        sierpinskiFold(p);
        rotX(p, angle);
        mengerFold(p);

        orbit = min(orbit, abs(p.xyz));

        p *= 1.57;
        p.xyz += vec3(-6.75, -4.0, -2.5);
    }

    return vec4(orbit, box_sdf(p, vec3(0.0), vec3(4.8)));
}



vec4 scene_sdf(vec3 point) {
    // Returns vec4(colour, ..., ..., distance)

    // Translation: point += vec3(amount_x, amount_y, amount_z)
    // Scaling: sdf(point / scaling_factor) * scaling_factor
    // Rotation: new_point = (inverse_mat4(rotate_A(angle)) * vec4(point, 1.0)).xyz

    float sun_sdf = sphere_sdf(vec4(point, 1.0), SUN_POSITION + vec3(0.0, 5.0, 0.0), 1.5);

    vec4 shape_sdf = vec4(0.0);
    if (fractal_index == 0) {
        shape_sdf = mandlebox(point);

    } else if (fractal_index == 1) {
        shape_sdf = mandlebulb(point);

    } else if (fractal_index == 2) {
        shape_sdf = menger_cube(point);

    } else if (fractal_index == 3) {
        shape_sdf = snow_stadium(point);
        
    } else if (fractal_index == 4) {
        shape_sdf = sierpinski_tetrahedron(point);
        
    } else if (fractal_index == 5) {
        shape_sdf = tree_block(point);

    } else if (fractal_index == 6) {
        shape_sdf = infinite_spheres(point);
    }
    
    vec4 final = vec4(shape_sdf.xyz, sdf_union(shape_sdf.w, sun_sdf));
    return final;
}

// Ray-March Algorithm
vec2 ray_march(vec3 eye, vec3 ray_direction) {
    // Returns vec3(distance, ray_steps_taken as a percentage)

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
    
    const vec3 light_intensity = vec3(1.0);
    color += phong_for_light(k_d, k_s, alpha, p, eye, SUN_POSITION, light_intensity);
    
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
        vec4(0.0, 0.0, 0.0, 1.0)
    );
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
        float de_colour = smoothstep(0.0, 1.0, DE_for_eye);

        gl_FragColor = vec4(de_colour, de_colour / 10.0, de_colour / 100.0, 1.0);
        return;
    }
    
    if (dist > MAX_DISTANCE - EPSILON) {
        // Didn't hit anything - GLOW
        gl_FragColor = vec4(vec3(ray_info.y) * 1.5, 1.0);
        return;
    }
    
    // The closest point on the surface to the eyepoint along the view ray
    vec3 point = eye + dist * world_ray_direction;
    
    if (colouring_index == 0) {
        // Orbit Trap
        gl_FragColor = vec4(smoothstep(0.05, 0.95, scene_sdf(point).xyz), 1.0);
    
    } else if (colouring_index == 1) {
        // Point-Based Colouring
        gl_FragColor = vec4(abs(normalize(point)), 1.0);

    } else if (colouring_index == 2) {
        // Based on the number of steps
        gl_FragColor = vec4(vec3(ray_info.y), 1.0);

    } else if (colouring_index == 3) {
        // Phong Shading

        vec3 K_a = vec3(0.2, 0.2, 0.2);
        vec3 K_d = vec3(0.7, 0.2, 0.2);
        vec3 K_s = vec3(1.0, 1.0, 1.0);
        float shininess = 10.0;
        
        vec3 color = get_phong_for_scene(K_a, K_d, K_s, shininess, point, eye);
        gl_FragColor = vec4(color, 1.0);
    
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
