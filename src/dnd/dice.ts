import * as _ from 'lodash';

const dSet = new Set<number>([2, 4, 6, 8, 10, 20]);

export function rollDie(d: number): number {
  return _.random(1, d);
}
