'use strict';

var canvas = document.getElementById('webgl-contents');
var gl = canvas.getContext('webgl');

var loadProgram = function loadProgram(gl, vs_src, fs_src) {
  var program = gl.createProgram();
  var vs = loadShader(gl.VERTEX_SHADER, gl, vs_src);
  var fs = loadShader(gl.FRAGMENT_SHADER, gl, fs_src);

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
};
var loadShader = function loadShader(type, gl, shader_src) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, shader_src);
  gl.compileShader(shader);
  return shader;
};
var createVBO = function createVBO(gl, array) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
};
var createIBO = function createIBO(gl, array) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return buffer;
};
var setArrayBuffer = function setArrayBuffer(gl, buffer, array, length) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(array);
  gl.vertexAttribPointer(array, length, gl.FLOAT, false, 0, 0);
};
var vertices = [-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0];
var indecies = [0, 2, 1, 1, 2, 3];
var init = function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  if (!gl.getExtension('OES_standard_derivatives')) {
    console.log('OES_standard_derivatives is not supported');
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);

  var time = 0;

  var program = loadProgram(gl, document.getElementById('vs').textContent, document.getElementById('fs').textContent);

  var uni_time = gl.getUniformLocation(program, 'time');
  gl.uniform1f(uni_time, time);

  var uni_mouse = gl.getUniformLocation(program, 'mouse');
  gl.uniform2fv(uni_mouse, [0, 0]);

  var uni_resolution = gl.getUniformLocation(program, 'resolution');
  gl.uniform2fv(uni_resolution, [window.innerWidth, window.innerHeight]);

  var attr_position = gl.getAttribLocation(program, 'position');
  var vertex_buffer = createVBO(gl, new Float32Array(vertices));

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var attr_index = gl.getAttribLocation(program, 'index');
  var index_buffer = createIBO(gl, new Uint16Array(indecies));

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  var render = function render() {
    time++;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    setArrayBuffer(gl, vertex_buffer, attr_position, 3);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    gl.uniform1f(uni_time, time);
    gl.uniform2fv(uni_resolution, [window.innerWidth, window.innerHeight]);

    gl.drawElements(gl.TRIANGLES, indecies.length, gl.UNSIGNED_SHORT, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  var renderLoop = function renderLoop() {
    render();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();
};
init();