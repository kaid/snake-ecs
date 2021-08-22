export interface Class<T> extends Function {
  prototype: T;

  new(...args: any[]): T;
}

export interface Renderer<D> {
  render(data: D): void;
}
