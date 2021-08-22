import { Renderer } from '../core/types';

export enum CanvasType {
  CPU = '2d',
  WEBGL2 = 'webgl2'
}

type RenderingContextMap = {
  [CanvasType.CPU]: CanvasRenderingContext2D;
  [CanvasType.WEBGL2]: WebGL2RenderingContext;
};

export interface RenderPayload {
  boardSize: number;
  batches: Map<string, number[]>;
}

export abstract class CanvasRenderer<K extends CanvasType> implements Renderer<RenderPayload> {
  public readonly canvas: HTMLCanvasElement;
  public readonly canvasContext: RenderingContextMap[K];

  protected constructor(container: HTMLElement, private readonly canvasType: CanvasType) {
    this.canvas = document.createElement('canvas');
    this.canvasContext = this.canvas.getContext(this.canvasType)! as RenderingContextMap[K];

    container.append(this.canvas);

    const size = Math.min(window.innerWidth, window.innerHeight);

    this.canvas.width = size;
    this.canvas.height = size;
  }

  public abstract render(data: RenderPayload): void;
}

interface Cell {
  x: number,
  y: number,
  h: number,
  w: number,
}

export class Canvas2DRenderer extends CanvasRenderer<CanvasType.CPU> {
  constructor(container: HTMLElement) {
    super(container, CanvasType.CPU);
  }

  public render(data: RenderPayload): void {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const [fill, positions] of data.batches.entries()) {
      this.canvasContext.fillStyle = fill

      for (const position of positions) {
        const cell = this.translatePosition(position, data.boardSize);
        this.canvasContext.fillRect(cell.x, cell.y, cell.w, cell.h);
      }
    }
  }

  private translatePosition(
    position: number,
    boardSize: number,
  ): Cell {
    const cellSize = this.canvas.height / boardSize;

    const column = position % boardSize;
    const row = Math.floor(position / boardSize);

    return {
      h: cellSize,
      w: cellSize,
      y: row * cellSize,
      x: column * cellSize,
    }
  }
}

export class CanvasWebGL2Renderer extends CanvasRenderer<CanvasType.WEBGL2> {
  constructor(container: HTMLElement) {
    super(container, CanvasType.WEBGL2);
  }

  public render(_data: RenderPayload): void {
  }
}
