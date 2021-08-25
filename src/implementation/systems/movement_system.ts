import { difference, range } from 'ramda';

import { randomFor } from '../../utils';
import { System, World } from '../../core/world';
import { Consumable, Direction, DirectionType, Moving, Position, Static, Velocity } from '../components';

const DirectionMovement = (boardSize: number) => ({
  [DirectionType.LEFT]: (cell: number) => cell - 1,
  [DirectionType.RIGHT]: (cell: number) => cell + 1,
  [DirectionType.UP]: (cell: number) => cell - boardSize,
  [DirectionType.DOWN]: (cell: number) => cell + boardSize,
});

export class MovementSystem extends System<Moving | Direction | Velocity | Position | Static | Consumable> {
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
      const direction = entity.get(Direction) as Direction;
      const position = entity.get(Position) as Position;

      const head = position.cells[position.cells.length - 1];
      const nextHeadCell = this.nextCell(head, direction);

      const staticCells = [...staticEntities].reduce(
        (result, staticEntity) => {
          const staticPosition = staticEntity.get(Position) as Position;
          return result.concat(staticPosition.cells);
        },
        [] as number[],
      );

      const willCollide = staticCells.includes(nextHeadCell);

      if (willCollide) {
        return;
      }

      for (const consumableEntity of consumableEntities) {
        const consumablePosition = consumableEntity.get(Position) as Position;
        const willConsume = consumablePosition.cells.includes(nextHeadCell);

        if (willConsume) {
          const newMovingCells = position.cells.concat(consumablePosition.cells);
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
    const {cells} = position;
    const headIndex = cells.length - 1;
    const nextHead = this.nextCell(cells[headIndex], direction);

    return new Position(cells.map((_cell, index) =>
      index === headIndex ? nextHead : cells[index + 1],
    ));
  }
}
