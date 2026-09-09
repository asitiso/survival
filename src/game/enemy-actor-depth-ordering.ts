export interface EnemyActorDepthLike {
  pos: {
    y: number;
  };
}

interface IndexedDepthItem<T> {
  item: T;
  index: number;
  depthY: number;
  finiteDepth: boolean;
}

export function stableWorldYDepthOrdered<T>(
  items: readonly T[],
  depthYFor: (item: T) => number,
): T[] {
  return items
    .map<IndexedDepthItem<T>>((item, index) => {
      const depthY = depthYFor(item);
      return {
        item,
        index,
        depthY,
        finiteDepth: Number.isFinite(depthY),
      };
    })
    .sort((a, b) => {
      if (a.finiteDepth !== b.finiteDepth) return a.finiteDepth ? -1 : 1;
      if (a.finiteDepth && b.finiteDepth && a.depthY !== b.depthY) return a.depthY - b.depthY;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export function enemyActorDepthOrdered<T extends EnemyActorDepthLike>(actors: readonly T[]): T[] {
  return stableWorldYDepthOrdered(actors, (actor) => actor.pos.y);
}
