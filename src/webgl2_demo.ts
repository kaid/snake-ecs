import VertexShader from './shaders/vertex.glsl';
import FragmentShader from './shaders/fragment.glsl';

const APP_ELEMENT = document.querySelector<HTMLDivElement>('#app')!

enum ShaderType {
  Vertex = WebGL2RenderingContext.VERTEX_SHADER,
  Fragment = WebGL2RenderingContext.FRAGMENT_SHADER,
}

const createShader = (
  gl: WebGL2RenderingContext,
  shaderType: ShaderType,
  shaderSource: string,
): WebGLShader => {
  const shader = gl.createShader(shaderType);

  if (!shader) {
    throw new Error('Create shader failure.');
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    const message = gl.getShaderInfoLog(shader)!;
    gl.deleteShader(shader);

    throw new Error(message);
  }

  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram => {
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Create program failure.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success) {
    const message = gl.getProgramInfoLog(program)!;
    gl.deleteProgram(program);

    throw new Error(message);
  }

  return program;
};

const setRectangle = (
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
): void => {
  const x1 = x + width;
  const y1 = y + height;

  const positions = new Float32Array([
    x, y,
    x1, y,
    x, y1,
    x, y1,
    x1, y,
    x1, y1,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
};

const drawRectangle = (
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  colorLocation: WebGLUniformLocation,
): void => {
  setRectangle(gl, x, y, width, height);

  gl.uniform4f(
    colorLocation,
    Math.random(),
    Math.random(),
    Math.random(),
    1
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

const randomInt = (range: number): number => Math.floor(Math.random() * range);

export const main = (): void => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2', { antialias: false });

  APP_ELEMENT.append(canvas);

  if (!gl) {
    return;
  }

  const vertexShader = createShader(gl, ShaderType.Vertex, VertexShader);
  const fragmentShader = createShader(gl, ShaderType.Fragment, FragmentShader);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    5, 2,
    80, 2,
    5, 30,
    5, 30,
    80, 2,
    80, 30,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();

  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;

  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionUniformLocation, window.innerWidth, window.innerHeight);

  for (let i = 0; i < 50; ++i) {
    const x = randomInt(300);
    const y = randomInt(300);
    const width = randomInt(window.innerWidth - x);
    const height = randomInt(window.innerHeight - y);

    drawRectangle(
      gl,
      x,
      y,
      width,
      height,
      colorUniformLocation!,
    );
  }
};
