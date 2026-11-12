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
        this.enable_animation = false;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    rotateLeft() {

    }
    
    //
    rotateRight() {

    }
    
    //
    moveLeft() {

    }
    
    //
    moveRight() {

    }
    
    //
    moveBackward() {

    }
    
    //
    moveForward() {

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

                // ddddddddddddddraw a segment between each consecutive pair.
                for (let k = 0; k < edge.length - 1; k++) {
                    let line = {
                        pt0: transformedVertices[edge[k]],
                        pt1: transformedVertices[edge[k + 1]]
                    };

                    // Jack my current code does NOT clip. when you get
                    // clipping to work, uncomment the code line bellow
                    // and delete the "let clippedLine = line"

                    //let clippedLine = this.clipLinePerspective(line, z_min);
                    let clippedLine = line;

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



                    // Bellow is temp code to mark vertices to make it less
                    // annoying to compare and preview the 3d model. idk how
                    // to fix the flipped numbers without messing with the css
                    
                    this.ctx.fillStyle = '#0000FF';
                    this.ctx.font = '14px Arial';

                    this.ctx.fillText(
                        edge[k].toString(),
                        p0.x + 6,
                        p0.y - 6
                    );

                    this.ctx.fillText(
                        edge[k + 1].toString(),
                        p1.x + 6,
                        p1.y - 6
                    );                    

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
        let result = null;
        let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
        let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        
        // TODO: implement clipping here!
        
        return result;
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
