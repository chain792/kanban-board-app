import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { v4 as uuidv4 } from 'uuid';
import { ContainersStore } from "../types/common";
import { arrayMove } from "@dnd-kit/sortable";

export const useContainersStore = create<ContainersStore>()(
  immer(
    devtools(
      set => ({
        containers: [
          {
            id: `container-1`,
            title: 'Todo',
            items: [
              {
                id: `item-a`,
                title: 'aa'
              },{
                id: `item-b`,
                title: 'b'
              }
            ]
          },


        ],
        moveItemInContainer: (containerId, sourceItemIndex, targetItemIndex) => (
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.items = arrayMove(container.items, sourceItemIndex, targetItemIndex)
              }
            })
          })
        ),
        moveContainer: (sourceContainerIndex, targetContainerIndex) => (
          set(state => { 
            state.containers = arrayMove(state.containers, sourceContainerIndex, targetContainerIndex)
          })
        ),
        moveItemBetweenContainers: (sourceContainerId, targetContainerId, targetItem, targetItemIndex) => (
          set(state => {             
            state.containers.forEach(container => {
              if (container.id === sourceContainerId) {
                container.items = container.items.filter(item => item.id !== targetItem.id)
              }
              else if (container.id === targetContainerId) {
                container.items.splice(targetItemIndex, 0, targetItem)
              }
            })
          })
        ),
        addNewItemToContainer: (targetContainerId, targetItemIndex, id) => (
          set(state => { 
            state.containers.forEach(container => {
              if (container.id === targetContainerId) {
                container.items.splice(targetItemIndex, 0, {
                  id,
                  title: 'new task'
                })
              }
            })
          })
        ),
        moveNewItemInContainer: (containerId, sourceItemIndex, targetItemIndex) => (
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.items[sourceItemIndex].id = `item-${uuidv4()}`
                container.items = arrayMove(container.items, sourceItemIndex, targetItemIndex)
              }
            })
          })
        ),
        setNewItemId: (containerId, itemIndex) => (
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.items[itemIndex].id = `item-${uuidv4()}`
              }
            })
          })
        ),
        addNewContainer: () => (
          set(state => {
            state.containers.push({
              id: `container-${uuidv4()}`,
              title: 'new card',
              items: []
            })
          })
        ),
        removeItem: (containerId, itemIndex) => (
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.items.splice(itemIndex, 1)
              }
            })
          })
        ),
        updateItemTitle: (containerId, itemIndex, title) => {
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.items[itemIndex].title = title
              }
            })
          })
        },
        removeContainer: (containerId) => (
          set(state => {
            state.containers = state.containers.filter(container => container.id !== containerId)
          })
        ),
        updateContainerTitle: (containerId, title) => {
          set(state => {
            state.containers.forEach(container => {
              if (container.id === containerId) {
                container.title = title
              }
            })
          })
        },
      }),
      {
        enabled: true,
      }
    )
  )
)
