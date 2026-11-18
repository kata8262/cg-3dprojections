import * as CG from './transforms.js';
import { Matrix, Vector } from "./matrix.js";

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        for (let i = 0; i < this.scene.models.length; i++) {
            if(this.scene.models[i].animation != null){

            }
        }
    }

    //
    rotateLeft() {
        let theta = Math.PI / 128;
        let vec = new Vector(3);
        vec.x = this.scene.view.srp.data[0][0] - this.scene.view.prp.data[0][0];
        vec.y = this.scene.view.srp.data[1][0] - this.scene.view.prp.data[1][0];
        vec.z = this.scene.view.srp.data[2][0] - this.scene.view.prp.data[2][0];
        let cross = vec.cross(this.scene.view.vup);
        
    }
    
    //
    rotateRight() {

    }
    
    //
    moveLeft() {
        let vec = new Vector(3);
        vec.x = this.scene.view.srp.data[0][0] - this.scene.view.prp.data[0][0];
        vec.y = this.scene.view.srp.data[1][0] - this.scene.view.prp.data[1][0];
        vec.z = this.scene.view.srp.data[2][0] - this.scene.view.prp.data[2][0];
        vec = vec.cross(this.scene.view.vup);
        vec.normalize();
        this.scene.view.srp.data = [[this.scene.view.srp.data[0][0] - vec.x], [this.scene.view.srp.data[1][0] - vec.y], 
            [this.scene.view.srp.data[2][0] - vec.z]];
        this.scene.view.prp.data = [[this.scene.view.prp.data[0][0] - vec.x], [this.scene.view.prp.data[1][0] - vec.y], 
            [this.scene.view.prp.data[2][0] - vec.z]];
    }
    
    //
    moveRight() {
        let vec = new Vector(3);
        vec.x = this.scene.view.srp.data[0][0] - this.scene.view.prp.data[0][0];
        vec.y = this.scene.view.srp.data[1][0] - this.scene.view.prp.data[1][0];
        vec.z = this.scene.view.srp.data[2][0] - this.scene.view.prp.data[2][0];
        vec = vec.cross(this.scene.view.vup);
        vec.normalize();
        this.scene.view.srp.data = [[this.scene.view.srp.data[0][0] + vec.x], [this.scene.view.srp.data[1][0] + vec.y], 
            [this.scene.view.srp.data[2][0] + vec.z]];
        this.scene.view.prp.data = [[this.scene.view.prp.data[0][0] + vec.x], [this.scene.view.prp.data[1][0] + vec.y], 
            [this.scene.view.prp.data[2][0] + vec.z]];
    }
    
    //
    moveBackward() {
        let vec = new Vector(3);
        vec.x = this.scene.view.srp.data[0][0] - this.scene.view.prp.data[0][0];
        vec.y = this.scene.view.srp.data[1][0] - this.scene.view.prp.data[1][0];
        vec.z = this.scene.view.srp.data[2][0] - this.scene.view.prp.data[2][0];
        vec.normalize();
        this.scene.view.srp.data = [[this.scene.view.srp.data[0][0] - vec.x], [this.scene.view.srp.data[1][0] - vec.y], 
            [this.scene.view.srp.data[2][0] - vec.z]];
        this.scene.view.prp.data = [[this.scene.view.prp.data[0][0] - vec.x], [this.scene.view.prp.data[1][0] - vec.y], 
            [this.scene.view.prp.data[2][0] - vec.z]];
    }
    
    //
    moveForward() {
        let vec = new Vector(3);
        vec.x = this.scene.view.srp.data[0][0] - this.scene.view.prp.data[0][0];
        vec.y = this.scene.view.srp.data[1][0] - this.scene.view.prp.data[1][0];
        vec.z = this.scene.view.srp.data[2][0] - this.scene.view.prp.data[2][0];
        vec.normalize();
        this.scene.view.srp.data = [[this.scene.view.srp.data[0][0] + vec.x], [this.scene.view.srp.data[1][0] + vec.y], 
            [this.scene.view.srp.data[2][0] + vec.z]];
        this.scene.view.prp.data = [[this.scene.view.prp.data[0][0] + vec.x], [this.scene.view.prp.data[1][0] + vec.y], 
            [this.scene.view.prp.data[2][0] + vec.z]];
    }

    //
    draw() {
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let view = this.scene.view;
        let viewTransform = CG.mat4x4Perspective(view.prp, view.srp, view.vup, view.clip);
        
        // project z=-1 then to canvas
        let projection = CG.mat4x4MPer();
        let viewport = CG.mat4x4Viewport(this.canvas.width, this.canvas.height);

        // near plane z by 1/far
        let z_min = -view.clip[4] / view.clip[5];

        for (let i = 0; i < this.scene.models.length; i++) {
            let model = this.scene.models[i];

            if(model.type == "cube"){
                // center
                let x = model.center.x;
                let y = model.center.y;
                let z = model.center.z;

                let w = model.width / 2;
                let h = model.height / 2;
                let d = model.depth / 2;

                model.vertices = [
                    // front
                    CG.Vector4(x - w, y - h, z + d, 1),
                    CG.Vector4(x + w, y - h, z + d, 1),
                    CG.Vector4(x + w, y + h, z + d, 1), 
                    CG.Vector4(x - w, y + h, z + d, 1),

                    // Back
                    CG.Vector4(x - w, y - h, z - d, 1),
                    CG.Vector4(x + w, y - h, z - d, 1),
                    CG.Vector4(x + w, y + h, z - d, 1),
                    CG.Vector4(x - w, y + h, z - d, 1)                 
                ];

                model.edges = [
                    // front n' back
                    [0, 1, 2, 3, 0],
                    [4, 5, 6, 7, 4],

                    // connecting edges
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7]
                ];
            }

            else if(model.type == "cone"){

            }
            else if(model.type == "cylinder"){

            }

            else if(model.type == "sphere"){
                let x = model.center.x;
                let y = model.center.y;
                let z = model.center.z;
                let radius = model.radius;
                let stacks = 12;
                let slices = 16;
                model.vertices = [];
                model.edges = [];

                // bottom to top vertices
                for (let i = 0; i <= stacks; i++) {
                    let phi = Math.PI * i / stacks;
                    // vertices around horizontal circles
                    for (let j = 0; j < slices; j++) {
                        let theta = 2 * Math.PI * j / slices;
                        let vx = x + radius * Math.sin(phi) * Math.cos(theta);
                        let vy = y + radius * Math.cos(phi);
                        let vz = z + radius * Math.sin(phi) * Math.sin(theta);     
                        model.vertices.push(CG.Vector4(vx, vy, vz, 1));                    
                    }
                }   

                // edges connect certices
                for (let i = 0; i <= stacks; i++) {
                    for (let j = 0; j < slices; j++) {
                        let current = i * slices + j;
                        let next = i * slices + (j + 1) % slices;

                        // Horizontal edges around the sphere
                        if (i > 0) {
                            model.edges.push([current, next]);
                        }

                        // Vertical edges between stacks
                        if (i < stacks) {
                            let below = (i + 1) * slices + j;
                            model.edges.push([current, below]);
                        }
                    }
                }                
            }

            let transformedVertices = [];

            //model transform first, then the view transform.
            for (let j = 0; j < model.vertices.length; j++) {
                let vertex = Matrix.multiply([
                    viewTransform,
                    model.matrix,
                    model.vertices[j]
                ]);

                transformedVertices.push(vertex);
            }

            // edges = list -> vertix indices
            for (let j = 0; j < model.edges.length; j++) {
                let edge = model.edges[j];

                // draw a segment between each consecutive pair.
                for (let k = 0; k < edge.length - 1; k++) {
                    let line = {
                        pt0: transformedVertices[edge[k]],
                        pt1: transformedVertices[edge[k + 1]]
                    };

                    // Jack my current code does NOT clip. when you get
                    // clipping to work, uncomment the code line bellow
                    // and delete the "let clippedLine = line"

                    let clippedLine = this.clipLinePerspective(line, z_min);
                    //let clippedLine = line;

                    // rejected segments have nothing to draw. 
                    if (clippedLine === null) {
                        continue;
                    }            

                    let p0 = CG.Vector4(clippedLine.pt0.x, clippedLine.pt0.y, clippedLine.pt0.z, 1);
                    let p1 = CG.Vector4(clippedLine.pt1.x, clippedLine.pt1.y, clippedLine.pt1.z, 1);

                    p0 = Matrix.multiply([projection, p0]);
                    p1 = Matrix.multiply([projection, p1]);         
                    
                    p0.scale(1 / p0.w);
                    p1.scale(1 / p1.w);

                    // converts to pixesl
                    p0 = Matrix.multiply([viewport, p0]);
                    p1 = Matrix.multiply([viewport, p1]);

                    this.drawLine(p0.x, p0.y, p1.x, p1.y);



            

                }
            }
        }
    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {
            outcode += NEAR;
        }
        return outcode;
    }

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {

        let p0 = CG.Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
        let p1 = CG.Vector3(line.pt1.x, line.pt1.y, line.pt1.z);

        while(true) {
            let out0 = this.outcodePerspective(p0, z_min);
            let out1 = this.outcodePerspective(p1, z_min);

            if ((out0 | out1) === 0) {
                return { pt0: p0, pt1: p1 };

            } else if ((out0 & out1) !== 0) {
                return null;

                // Line needs to be clipped
            } else {
                let out;

                // find which vertex needs to be worked on 
                if (out0 !== 0) {
                    out = out0;
                } else {
                    out = out1;
                }

                let delta_x = p1.x - p0.x;
                let delta_y = p1.y - p0.y;
                let delta_z = p1.z - p0.z;

                let t = 0;

                // gotta find which clipping plane outside and find where the line intersects
                // last slide in 3D Clipping.pptx
                if ((out & LEFT) !== 0) {
                    t = (p0.z - p0.x) / (delta_x - delta_z);

                } else if ((out & RIGHT) !== 0) {
                    t = (-p0.z - p0.x) / (delta_x + delta_z);

                } else if ((out & BOTTOM) !== 0) {
                    t = (p0.z - p0.y) / (delta_y - delta_z);

                } else if ((out & TOP) !== 0) {
                    t = (-p0.z - p0.y) / (delta_y + delta_z);

                } else if ((out &  FAR) !== 0) {
                    t = (-1 - p0.z) / delta_z;

                } else if ((out & NEAR) !== 0) {
                    t = (z_min - p0.z) / delta_z;
                }

                let intersection = CG.Vector3(
                    p0.x + t * delta_x, p0.y + t * delta_y, p0.z + t * delta_z);
                
                if (out == out0) {
                    p0 = intersection;
                } else {
                    p1 = intersection;
                }
            }
        }
    }
    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: CG.Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: CG.Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: CG.Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(CG.Vector4(scene.models[i].vertices[j][0],
                                                   scene.models[i].vertices[j][1],
                                                   scene.models[i].vertices[j][2],
                                                   1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = CG.Vector4(scene.models[i].center[0],
                                         scene.models[i].center[1],
                                         scene.models[i].center[2],
                                         1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
};

export { Renderer };
