export interface EnemyActorDepthLike {
  pos: {
    y: number;
  };
}

interface IndexedActor<T extends EnemyActorDepthLike> {
  actor: T;
  index: number;
  depthY: number;
  finiteDepth: boolean;
}

export function enemyActorDepthOrdered<T extends EnemyActorDepthLike>(actors: readonly T[]): T[] {
  return actors
    .map<IndexedActor<T>>((actor, index) => {
      const depthY = actor.pos.y;
      return {
        actor,
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
    .map(({ actor }) => actor);
}
