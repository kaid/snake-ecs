import { range } from 'ramda';

import { randomFor } from '../utils';
import { Entity } from '../core/entity';
import {
  Color,
  Consumable,
  Direction,
  DirectionType,
  Moving,
  Position, Static,
  Velocity,
} from './components';

export class Obstacle extends Entity<Position | Color | Static> {
  constructor(boardSize: number) {
    super(
      new Static(),
      new Color('brown'),
      new Position([
        ...range(0, boardSize),
        ...range(1, boardSize).reduce(
          (result: number[], rowNumber: number) => {
            const rowStart = rowNumber * boardSize;
            const rowEnd = rowStart + boardSize - 1;
            return [...result, ...[rowStart, rowEnd]];
          },
          [] as number[],
        ),
        ...range(boardSize * (boardSize - 1), boardSize * boardSize),
      ]),
    );
  }
}

export class Snake extends Entity<Position | Velocity | Direction | Moving> {
  constructor(boardSize: number) {
    const row = boardSize * Math.floor(boardSize / 2);
    const head = row + Math.floor(boardSize / 2) - 1;
    const body = head - 1;
    const tail = body - 1;

    super(
      new Moving(),
      new Velocity(1),
      new Color('blue'),
      new Direction(DirectionType.RIGHT),
      new Position([tail, body, head]),
    );
  }
}

export class Food extends Entity<Position | Color | Consumable> {
  constructor(boardSize: number) {
    super(
      new Consumable(),
      new Color('green'),
      new Position([boardSize * randomFor(boardSize, 1) + randomFor(boardSize - 2)]),
    );
  }
}
