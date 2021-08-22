import { Class } from './types';

export abstract class Component {
  get [Symbol.species](): Class<this> {
    return this.constructor as Class<this>;
  }
}
