import './style.css';
import { World } from './core/world';
import { Component} from './core/component';
import { Food, Obstacle, Snake } from './implementation/entities';
import { Canvas, InputHandler, Movement } from './implementation/systems';
import { Color, Direction, Position, Velocity, Moving } from './implementation/components';

const makeLoop = (world: World<Component>) => {
  const loopContext = { last: -1, loopId: -1 };

  const loop = (dt: number) => {
    if (loopContext.last < 0 || dt - loopContext.last >= 160) {
      world.run(dt);
      loopContext.last = dt;
    }

    loopContext.loopId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(loopContext.loopId);
      world.tearDown();
    }
  }

  return { loop, loopContext };
}

type ComponentUnion = Position | Color | Direction | Velocity | Moving;

const setupWorld = () => {
  const boardSize = 64;

  const world = new World<ComponentUnion>(
    new InputHandler(),

    new Movement(boardSize),
    new Canvas(boardSize),
  );

  world.addEntity(new Obstacle(boardSize));
  world.addEntity(new Snake(boardSize));
  world.addEntity(new Food(boardSize));

  return world;
};

const Bootstrap = () => {
  const { loop } = makeLoop(setupWorld());
  const tearDown = loop(performance.now());

  document.addEventListener('keydown', event => {
    if (event.code === 'Escape') {
      const shouldRestart = confirm('是否重开？');

      if (shouldRestart) {
        tearDown();
        Bootstrap();
      }
    }
  });
};

Bootstrap();
