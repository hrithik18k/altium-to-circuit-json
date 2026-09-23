import type { SchematicPointKey } from "../geometry"

export class PointDisjointSet {
  private readonly parent = new Map<SchematicPointKey, SchematicPointKey>()

  add(pointKey: SchematicPointKey): void {
    if (!this.parent.has(pointKey)) this.parent.set(pointKey, pointKey)
  }

  find(pointKey: SchematicPointKey): SchematicPointKey {
    this.add(pointKey)
    const parent = this.parent.get(pointKey) ?? pointKey
    if (parent === pointKey) return pointKey
    const root = this.find(parent)
    this.parent.set(pointKey, root)
    return root
  }

  union(left: SchematicPointKey, right: SchematicPointKey): void {
    const leftRoot = this.find(left)
    const rightRoot = this.find(right)
    if (leftRoot !== rightRoot) this.parent.set(rightRoot, leftRoot)
  }
}
