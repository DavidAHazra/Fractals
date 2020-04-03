import { Vector3, normalize_vec3, deg_to_rad, add_vec3, mult_vec3, cross_vec3 } from './maths'


export default class Camera {
    constructor() {
        this.UP_VECTOR = new Vector3(0, 1, 0);
        this.MIN_SPEED = 0.001;

        this.speed = 0.5;

        this.position = new Vector3(2, 2, 2);
        this.pitch = -25;
        this.yaw = 222;

        this.pressed_status = {
            'w': false,
            's': false,
            'a': false,
            'd': false
        }

        document.addEventListener('keydown', event => {
            if (document.pointerLockElement === null) { return; }
            this.key_pressed(event.key);
        });

        document.addEventListener('keyup', event => {
            if (document.pointerLockElement === null) { return; }
            this.key_released(event.key);
        });

        document.addEventListener('mousemove', event => {
            if (document.pointerLockElement === null) { return; }
            this.move_view(event.movementX, event.movementY);
        });
    }

    update() {
        if (this.pressed_status['w']) { this.move(1, 0, 0);  }
        if (this.pressed_status['s']) { this.move(-1, 0, 0); }
        if (this.pressed_status['a']) { this.move(0, -1, 0); }
        if (this.pressed_status['d']) { this.move(0, 1, 0);  }
    }

    set_speed(new_speed) {
        const constant_modifier = 0.1;
        this.speed = new_speed * constant_modifier;
    }

    get_look_direction() {
        return normalize_vec3(new Vector3(
            Math.cos(deg_to_rad(this.yaw)) * Math.cos(deg_to_rad(this.pitch)),
            Math.sin(deg_to_rad(this.pitch)),
            Math.sin(deg_to_rad(this.yaw)) * Math.cos(deg_to_rad(this.pitch))
        ));
    }

    get_looking_at_point() {
        return add_vec3(this.position, this.get_look_direction());
    }

    // Movements
    key_pressed(key) {
        this.pressed_status[key] = true;
    }

    key_released(key) {
        this.pressed_status[key] = false;
    }

    move(amount_forward, amount_right, amount_up) {
        const front_vector = this.get_look_direction();

        // Back and Forward
        this.position = add_vec3(this.position, mult_vec3(front_vector, this.speed * amount_forward));

        // Left and Right
        this.position = add_vec3(
            this.position,
            mult_vec3(
                normalize_vec3(cross_vec3(front_vector, this.UP_VECTOR)),
                this.speed * amount_right
            )
        )

        // Up and Down
        this.position = add_vec3(this.position, new Vector3(0, this.speed * amount_up, 0));
    }

    move_view(x_offset, y_offset) {
        const sensitivity = 0.1;
        x_offset *= sensitivity;
        y_offset *= -sensitivity;

        this.yaw += x_offset;
        this.pitch += y_offset;

        const max_angle = 89.5;
        if (this.pitch > max_angle) { this.pitch = max_angle; }
        if (this.pitch < -max_angle) { this.pitch = -max_angle; }
    }
}