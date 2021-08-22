import { difference, range } from 'ramda';
import { System, World } from '../core/world';
import { Canvas2DRenderer, RenderPayload } from '../render/canvas_renderer';
import { Color, Consumable, Direction, DirectionType, Moving, Position, Static, Velocity } from './components';
import { randomFor } from '../utils';

export class Canvas extends System<Position | Color> {
  private renderer: Canvas2DRenderer;

  constructor(public readonly size: number) {
    super();
    this.renderer = new Canvas2DRenderer(document.querySelector('#app')!);
  }

  public run(world: World<Position | Color>): void {
    const entities = world.getEntitiesBy(Position, Color);

    const payload = [...entities].reduce(
      (result, entity) => {
        const color = entity.get(Color) as Color;
        const colorPosition = result.batches.get(color.value) || [];
        const position = entity.get(Position) as Position;
        const batch = Array.from(new Set([...colorPosition, ...position.positions]));

        result.batches.set(color.value, batch);

        return result;
      },
      {boardSize: this.size, batches: new Map()} as RenderPayload,
    );

    this.renderer.render(payload);
  }

  public tearDown():void {
    super.tearDown();
    this.renderer.canvas.remove();
  }
}

const KeyDirectionMap: { [code: string]: DirectionType } = {
  ArrowUp: DirectionType.UP,
  ArrowDown: DirectionType.DOWN,
  ArrowLeft: DirectionType.LEFT,
  ArrowRight: DirectionType.RIGHT,
};

const ConflictingDirectionMap = {
  [DirectionType.UP]: DirectionType.DOWN,
  [DirectionType.DOWN]: DirectionType.UP,
  [DirectionType.LEFT]: DirectionType.RIGHT,
  [DirectionType.RIGHT]: DirectionType.LEFT,
};

export class InputHandler extends System<Direction> {
  private direction: DirectionType = DirectionType.RIGHT;

  constructor() {
    super();

    document.addEventListener('keydown', this.keyDownHandler);
  }

  public run(world: World<Direction>): void {
    const entities = world.getEntitiesBy(Direction);

    for (const entity of entities) {
      const entityDirection = entity.get(Direction) as Direction;
      const isSameDirection = this.direction === entityDirection.type;
      const isConflictingDirection = ConflictingDirectionMap[this.direction] === entityDirection.type;

      if (isSameDirection || isConflictingDirection) {
        continue;
      }

      entity.add(new Direction(this.direction));
    }
  }

  public tearDown() {
    super.tearDown();
    document.removeEventListener('keydown', this.keyDownHandler);
  }

  private keyDownHandler = (event: KeyboardEvent) => {
    if (Object.keys(KeyDirectionMap).includes(event.code)) {
      this.direction = KeyDirectionMap[event.code];
    }
  };
}

const DirectionMovement = (boardSize: number) => ({
  [DirectionType.LEFT]: (cell: number) => cell - 1,
  [DirectionType.RIGHT]: (cell: number) => cell + 1,
  [DirectionType.UP]: (cell: number) => cell - boardSize,
  [DirectionType.DOWN]: (cell: number) => cell + boardSize,
});

export class Movement extends System<Moving | Direction | Velocity | Position | Static | Consumable> {
  private readonly directionMovementMap: { [key in DirectionType]: (cell: number) => number };

  constructor(public readonly boardSize: number) {
    super();
    this.directionMovementMap = DirectionMovement(this.boardSize);
  }

  public run(world: World<Direction | Velocity | Position | Moving | Static>): void {
    const staticEntities = world.getEntitiesBy(Static, Position);
    const consumableEntities = world.getEntitiesBy(Position, Consumable);
    const movingEntities = world.getEntitiesBy(Direction, Velocity, Position, Moving);

    for (const entity of movingEntities) {
      const direction = entity.get(Direction)! as Direction;
      const position = entity.get(Position)! as Position;

      const head = position.positions[position.positions.length - 1];
      const nextHeadCell = this.nextCell(head, direction);

      const staticCells = [...staticEntities].reduce(
        (result, staticEntity) => {
          const staticPosition = staticEntity.get(Position) as Position;
          return result.concat(staticPosition.positions);
        },
        [] as number[],
      );

      const willCollide = staticCells.includes(nextHeadCell);

      if (willCollide) {
        return;
      }

      for (const consumableEntity of consumableEntities) {
        const consumablePosition = consumableEntity.get(Position) as Position;
        const willConsume = consumablePosition.positions.includes(nextHeadCell);

        if (willConsume) {
          const newMovingCells = position.positions.concat(consumablePosition.positions);
          const availableCell = difference(
            range(0, this.boardSize * this.boardSize),
            staticCells.concat(newMovingCells),
          );

          consumableEntity.add(new Position([availableCell[randomFor(availableCell.length)]]));
          entity.add(new Position(newMovingCells));

          return;
        }
      }

      entity.add(this.nextPosition(position, direction));
    }
  }

  private nextCell(cell: number, direction: Direction): number {
    return this.directionMovementMap[direction.type](cell);
  }

  private nextPosition(position: Position, direction: Direction): Position {
    const {positions} = position;
    const headIndex = positions.length - 1;
    const nextHead = this.nextCell(positions[headIndex], direction);

    return new Position(positions.map((_cell, index) =>
      index === headIndex ? nextHead : positions[index + 1],
    ));
  }
}
