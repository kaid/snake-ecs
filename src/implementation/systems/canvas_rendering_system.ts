import { Color, Position } from '../components';
import { System, World } from '../../core/world';
import { Renderer, TearDown } from '../../core/types';
import { RenderPayload } from '../../render/canvas_renderer';

export class CanvasRenderingSystem extends System<Position | Color> {
  constructor(
    public readonly size: number,
    private readonly renderer: Renderer<RenderPayload> & TearDown,
  ) {
    super();
  }

  public run(world: World<Position | Color>): void {
    const entities = world.getEntitiesBy(Position, Color);

    const payload = [...entities].reduce(
      (result, entity) => {
        const color = entity.get(Color) as Color;
        const colorPosition = result.batches.get(color.value) || [];
        const position = entity.get(Position) as Position;
        const batch = Array.from(new Set([...colorPosition, ...position.cells]));

        result.batches.set(color.value, batch);

        return result;
      },
      {boardSize: this.size, batches: new Map()} as RenderPayload,
    );

    this.renderer.render(payload);
  }

  public tearDown(): void {
    super.tearDown();
    this.renderer.tearDown();
  }
}
