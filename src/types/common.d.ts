import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"

export interface Item {
  id: string,
  title: string
}

export interface Container {
  id: string,
  title: string,
  items: Item[]
}

export interface ContainersStore {
  containers: Container[],
  moveItemInContainer:
    (
      sourceContainerId: string,
      sourceItemIndex: number,
      targetItemIndex: number
    ) => void,
  moveContainer:
    (
      sourceContainerId: number,
      targetContainerId: number,
    ) => void,
  moveItemBetweenContainers: 
    (
      sourceContainerId: string,
      targetContainerId: string,
      targetItem: Item,
      targetItemIndex: number
    ) => void
}

export type DragOverStartFunction = (event: DragStartEvent) => void
export type DragOverEventFunction = (event: DragOverEvent) => void
export type DragOverEndFunction = (event: DragEndEvent) => void
export type DragOverEndFunction = (id: string) => Container | undefined
