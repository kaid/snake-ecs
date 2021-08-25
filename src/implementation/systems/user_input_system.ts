import { System, World } from '../../core/world';
import { Direction, DirectionType } from '../components';

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

export class UserInputSystem extends System<Direction> {
  private direction: DirectionType = DirectionType.RIGHT;

  constructor() {
    super();

    document.addEventListener('keydown', this.keyDownHandler);
  }

  public run(world: World<Direction>): void {
    const entities = world.getEntitiesBy(Direction);

    for (const entity of entities) {
      const entityDirection = entity.get(Direction);
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
