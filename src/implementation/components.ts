import { Component } from '../core/component';

export class Color extends Component {
  constructor(public readonly value: string) {
    super();
  }
}

export class Position extends Component {
  constructor(public readonly positions: number[]) {
    super();
  }
}

export enum DirectionType {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export class Direction extends Component {
  constructor(public readonly type: DirectionType) {
    super();
  }
}

export class Moving extends Component {
}

export class Static extends Component {
}

export class Velocity extends Component {
  constructor(public readonly value: number) {
    super();
  }
}

export class Consumable extends Component {
}
