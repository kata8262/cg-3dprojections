import { Matrix, Vector } from "./matrix.js";

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {

    let [left, right, bottom, top, near, far] = clip;
    // 1. translate PRP to origin
    let translatePRP = mat4x4Translate(new Matrix(4,4), -(prp.x), -(prp.y), -(prp.z));

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let naxis =  prp.subtract(srp);
    naxis.normalize();
    let uaxis = vup.cross(naxis);
    uaxis.normalize();
    let vaxis = naxis.cross(uaxis);

    let R = new Matrix(4,4);
    R.values = 
    [[uaxis.x, uaxis.y, uaxis.z, 0],
    [ vaxis.x, vaxis.y, vaxis.z, 0],
    [ naxis.x, naxis.y, naxis.z, 0],
    [      0,       0,        0, 1]];

    
    // 3. shear such that CW is on the z-axis 
    let cw = Vector3((left + right) / 2,(bottom + top) / 2,-(near));
    // dop = cw since prp in origin of vrc
    let shx_par = -(cw.x) / cw.z;
    let shy_par = -(cw.y) / cw.z;
    let SH_par = mat4x4ShearXY(new Matrix(4,4), shx_par, shy_par);

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let svals = Vector3((2 * near) / ((right - left) * far),
                        (2 * near) / ((top - bottom) * far),
                                                                  1 / far);
    let Sper = mat4x4Scale(new Matrix(4, 4), svals.x, svals.y, svals.z);

    let transform = Matrix.multiply([Sper, SH_par, R, translatePRP]);
    return transform;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = 
     [[1, 0, 0, 0 ],
      [0, 1, 0, 0 ],
      [0, 0, 1, 0 ],
      [0, 0, -1, 0]];
      
    return mper;
}

// create a 4x4 matrix to translate/scale projected vertices to the viewport (window)
function mat4x4Viewport(width, height) {
    let viewport = new Matrix(4, 4);
    viewport.values = 
    [[width / 2, 0,   0, width / 2 ],
     [0, -height / 2, 0, height / 2],
     [0, 0,           1,          0],
     [0, 0,           0,          1]];
    return viewport;
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = 
        [[1, 0, 0, tx],
        [ 0, 1, 0, ty],
        [ 0, 0, 1, tz],
        [0, 0,  0,  1]];

        return mat4x4;
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values =
    [[sx, 0, 0, 0],
    [ 0, sy, 0, 0],
    [ 0, 0, sz, 0],
    [ 0, 0, 0,  1]];

    return mat4x4;
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);

    mat4x4.values = 
    [[1, 0,    0,   0],
     [0, cos, -sin, 0],
     [0, sin, cos, 0],
     [0, 0, 0, 1    ]]; // i cannot be bothered for spacing and alignment anymore pissing me off

     return mat4x4;
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);

    mat4x4.values = 
    [[cos, 0, sin, 0 ],
     [0, 1, 0, 0     ],
     [-sin, 0, cos, 0],
     [0, 0, 0, 1     ]];

     return mat4x4;
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);

    mat4x4.values = 
    [[cos, -sin, 0, 0],
     [sin, cos, 0,  0],
     [0,   0,   1,  0],
     [0,   0,   0,   ]];

     return mat4x4;
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = 
    [[1, 0, shx, 0],
     [0, 1, shy, 0],
     [0, 0,  1,  0],
     [0, 0, 0,   1]];

     return mat4x4;
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}

export {
    mat4x4Perspective,
    mat4x4MPer,
    mat4x4Viewport,
    mat4x4Identity,
    mat4x4Translate,
    mat4x4Scale,
    mat4x4RotateX,
    mat4x4RotateY,
    mat4x4RotateZ,
    mat4x4ShearXY,
    Vector3,
    Vector4
};
