import './style.css';
import { Game } from './core/game';
import { World } from './core/world';
import { Canvas2DGridRenderer } from './render/canvas_renderer';
import { Food, Obstacle, Snake } from './implementation/entities';
import { MovementSystem } from './implementation/systems/movement_system';
import { UserInputSystem } from './implementation/systems/user_input_system';
import { CanvasRenderingSystem } from './implementation/systems/canvas_rendering_system';
import { Color, Direction, Moving, Position, Velocity } from './implementation/components';

type ComponentUnion = Position | Color | Direction | Velocity | Moving;

const setupWorld = () => {
  const boardSize = 64;

  const world = new World<ComponentUnion>(
    new UserInputSystem(),
    new MovementSystem(boardSize),
    new CanvasRenderingSystem(
      boardSize,
      new Canvas2DGridRenderer(document.querySelector('#app')!),
    ),
  );

  world.addEntity(new Obstacle(boardSize));
  world.addEntity(new Snake(boardSize));
  world.addEntity(new Food(boardSize));

  return world;
};

const Main = () => {
  const world = setupWorld();

  const game = new Game(
    160,
    world.run,
    ({ loopId }) => {
      cancelAnimationFrame(loopId);
      world.tearDown();
    }
  );

  document.addEventListener('keydown', event => {
    if (event.code !== 'Escape') {
      return;
    }

    const shouldRestart = confirm('是否重开？');

    if (shouldRestart) {
      game.tearDown();
      game.start();
    }
  });

  game.start();
};

Main();
