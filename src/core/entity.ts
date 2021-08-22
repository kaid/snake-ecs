import { nanoid } from 'nanoid';

import { Class } from './types';
import { Component } from './component';

export class Entity<C extends Component> {
  public readonly key: string;
  public components: Map<Class<C>, C>;

  constructor(...components: Array<C>) {
    this.key = nanoid();
    this.components = new Map<Class<C>, C>();

    for (const component of components) {
      this.add(component);
    }
  }

  public get(componentClass: Class<C>): C | undefined {
    return this.components.get(componentClass);
  }

  public add(component: C): void {
    this.components.set(component.constructor as Class<C>, component);
  }

  public remove(componentClass: Class<C>): void {
    this.components.delete(componentClass);
  }
}

