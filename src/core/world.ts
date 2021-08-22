import { Class } from './types';
import { Entity } from './entity';
import { Component } from './component';

export abstract class System<C extends Component> {
  public abstract run(world: World<C>, dt: number): void;

  public tearDown(): void {
    console.log(`清理${this.constructor.name}系统`);
  }
}

export class World<C extends Component> {
  private entities: Set<Entity<C>>;
  private readonly systems: Array<System<C>>;
  private componentEntityMap: Map<Class<C>, Set<Entity<C>>>;

  constructor(...systems: Array<System<C>>) {
    this.systems = systems;
    this.entities = new Set();
    this.componentEntityMap = new Map<Class<C>, Set<Entity<C>>>();
  }

  public addEntity(entity: Entity<C>): void {
    this.entities.add(entity);

    for (const componentClass of entity.components.keys()) {
      this.setEntitiesFor(componentClass, entities => {
        entities.add(entity);
        return entities;
      });
    }
  }

  public removeEntity(entity: Entity<C>): void {
    this.entities.delete(entity);

    for (const componentClass of entity.components.keys()) {
      this.setEntitiesFor(componentClass, entities => {
        entities.delete(entity);
        return entities;
      });
    }
  }

  private setEntitiesFor(
    componentClass: Class<C>,
    callback: (set: Set<Entity<C>>) => Set<Entity<C>>,
  ): void {
    const result = callback(this.componentEntityMap.get(componentClass) || new Set<Entity<C>>());
    this.componentEntityMap.set(componentClass, result);
  }

  public hasEntity(entity: Entity<C>): boolean {
    return this.entities.has(entity);
  }

  public getEntitiesBy(...componentClasses: Array<Class<C>>) {
    return componentClasses.reduce(
      (result, componentClass) => {
        const entities = this.componentEntityMap.get(componentClass) || new Set<Entity<C>>();

        if (result.size === 0) {
          return entities;
        }

        return new Set([...result].filter(entity => entity.get(componentClass)));
      },
      new Set<Entity<C>>(),
    );
  }

  public run(dt: number) {
    for (const system of this.systems) {
      system.run(this, dt);
    }
  }

  public tearDown() {
    for (const system of this.systems) {
      system.tearDown();
    }
  }
}
