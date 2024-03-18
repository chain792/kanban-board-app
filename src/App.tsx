// @ts-nocheck
import "bootstrap/dist/css/bootstrap.min.css";
import { Container as  DivContainer } from "react-bootstrap";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import SortableContainer from "./components/SortableContainer";
import { useContainersStore } from "./stores/containersStore";
import { useShallow } from "zustand/react/shallow";
import {
  Container,
  DragOverEndFunction,
  DragOverEventFunction,
  DragOverStartFunction,
} from "./types/common";
import { useEffect, useRef, useState } from "react";
import Item from "./components/Item";
import OverlayContainer from "./components/Container";
import Sidebar from "./components/Sidebar";

function App() {
  const [
    containers,
    moveItemInContainer,
    moveContainer,
    moveItemBetweenContainers,
    addNewItemToContainer,
    moveNewItemInContainer,
    setNewItemId,
    addNewContainer,
    removeItem,
  ] = useContainersStore(
    useShallow((state) => {
      return [
        state.containers,
        state.moveItemInContainer,
        state.moveContainer,
        state.moveItemBetweenContainers,
        state.addNewItemToContainer,
        state.moveNewItemInContainer,
        state.setNewItemId,
        state.addNewContainer,
        state.removeItem
      ];
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const [count, setCount] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart: DragOverStartFunction = (event) => {
    const { active } = event;

    setActiveId(active.id.toString());
  };

  const dragEndItem = (activeId: string, overId: string) => {
    const activeContainer = findContainerByItemId(activeId);
    const overContainer = findContainerByItemId(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer.id !== overContainer.id
    ) {
      return;
    }

    const activeItemIndex = findItemIndexByItemId(activeContainer, activeId)
    const overItemIndex = findItemIndexByItemId(overContainer, overId)


    if (activeItemIndex === null || overItemIndex === null) return;

    if (activeId.startsWith("item")) {
      moveItemInContainer(activeContainer.id, activeItemIndex, overItemIndex);
    } else if (activeId.startsWith("new-item")) {
      moveNewItemInContainer(activeContainer.id, activeItemIndex, overItemIndex);
    } else {
      throw RangeError()
    }
  }

  const dragEndContainer = (activeId: string, overId: string) => {
    const activeContainerIndex = findContainerIndexByContainerId(activeId)
    const overContainerIndex = findContainerIndexByContainerId(overId)

    if (
      activeContainerIndex === null ||
      overContainerIndex === null ||
      activeContainerIndex === overContainerIndex
    ) {
      return;
    }

    moveContainer(activeContainerIndex, overContainerIndex);
  }

  const dragEndNewItem = (activeId: string, overId: string) => {
    if (overId.startsWith("item")) {
      dragEndItem(activeId, overId)
    } else if (overId.startsWith("new-item")) {
      dragEndItem(activeId, overId)
    } else if (overId.startsWith("container")) {
      const activeContainer = findContainerByItemId(activeId);

      if (!activeContainer) return;

      const activeItemIndex = findItemIndexByItemId(activeContainer, activeId)
      if (activeItemIndex === null) return;

      setNewItemId(activeContainer.id, activeItemIndex);
    }
  }

  // ドラッグを修了した時に実行される処理
  const handleDragEnd: DragOverEndFunction = (event) => {
    setActiveId(null);

    const { active, over } = event;

    const activeId = active.id.toString();
    if (activeId.startsWith("new-item") ){
      setCount(count + 1)
    }

    if (!over) return;

    const overId = over.id.toString();

    if (
      activeId.startsWith("item") &&
      overId.startsWith("item") &&
      activeId !== overId
    ) {
      // itemのsort結果を保存する
      dragEndItem(activeId, overId)
      return;
    }

    if (
      activeId.startsWith("container") &&
      overId.startsWith("container") &&
      activeId !== overId
    ) {
      // containerのsort結果を保存する
      dragEndContainer(activeId, overId)
      return;
    }

    if (activeId.startsWith("new-item")) {
      dragEndNewItem(activeId, overId)
    }
  };

  const dragOverFromItem = (activeId: string, overId: string, overBlockType: 'item' | 'container') => {
    const activeContainer = findContainerByItemId(activeId);
    const overContainer = overBlockType === 'item' ? findContainerByItemId(overId) : findContainerByContainerId(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer.id === overContainer.id
    ) {
      return
    }

    const activeItem = findItemByItemId(activeContainer, activeId)
    const overItemIndex = overBlockType === 'item' ? findItemIndexByItemId(overContainer, overId) : overContainer.items.length

    if (!activeItem || overItemIndex === null) return;

    recentlyMovedToNewContainer.current = true;
    moveItemBetweenContainers(
      activeContainer.id,
      overContainer.id,
      activeItem,
      overItemIndex
    );
  }

  const dragOverFromNewItem = (activeId: string, overId: string, overBlockType: 'item' | 'container') => {
    const addedContainer = findContainerByItemId(activeId);
    const overContainer = overBlockType === 'item' ? findContainerByItemId(overId) : findContainerByContainerId(overId);

    if (!overContainer) return;

    if (addedContainer) {
      if (addedContainer.id === overContainer.id) {
        return;
      } else {
        const activeItem = findItemByItemId(addedContainer, activeId)
        const overItemIndex = overBlockType === 'item' ? findItemIndexByItemId(overContainer, overId) : overContainer.items.length

        if (!activeItem || overItemIndex === null) return;

        recentlyMovedToNewContainer.current = true;
        moveItemBetweenContainers(
          addedContainer.id,
          overContainer.id,
          activeItem,
          overItemIndex
        );
        return;
      }
    } else {
      const overItemIndex = overBlockType === 'item' ? findItemIndexByItemId(overContainer, overId) : overContainer.items.length

      if (overItemIndex === null) return;

      recentlyMovedToNewContainer.current = true;
      addNewItemToContainer(overContainer.id, overItemIndex, activeId);
    }
  }

  const dragOverFromNewItemToSidebar = (activeId: string) => {
    const addedContainer = findContainerByItemId(activeId);
    if (!addedContainer) return;

    const activeItemIndex = findItemIndexByItemId(addedContainer, activeId)
    if (activeItemIndex === null) return;

    removeItem(addedContainer.id, activeItemIndex)
  }

  // Droppable の領域を超えた時に実行される処理
  const handleDragOver: DragOverEventFunction = (event) => {
    if (recentlyMovedToNewContainer.current) return;

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (
      activeId.startsWith("item") &&
      overId.startsWith("item") &&
      activeId !== overId
    ) {
      // itemを別のコンテナに移動する
      dragOverFromItem(activeId, overId, 'item')
      return;
    }

    if (activeId.startsWith("item") && overId.startsWith("container")) {
      // itemを別のコンテナに移動する
      dragOverFromItem(activeId, overId, 'container')
      return;
    }

    if (activeId.startsWith("new-item") && overId.startsWith("item")) {
      // new itemを別のコンテナに移動 or 追加する
      dragOverFromNewItem(activeId, overId, 'item')
      return
    }

    if (activeId.startsWith("new-item") && overId.startsWith("container")) {
      // new itemを別のコンテナに移動 or 追加する
      dragOverFromNewItem(activeId, overId, 'container')
      return
    }

    if (activeId.startsWith("new-item") && overId.startsWith("sidebar")) {
      // new itemを削除する
      dragOverFromNewItemToSidebar(activeId)
      return
    }
  };

  const findContainerByItemId = (id: string) => {
    return containers.find((container) =>
      container.items.some((item) => item.id === id)
    );
  };

  const findContainerByContainerId = (id: string) => {
    return containers.find(
      (container) => container.id === id
    );
  };

  const findContainerIndexByContainerId = (id: string) => {
    const index =  containers.findIndex(
      (container) => container.id === id
    );
    return index !== -1 ? index : null 
  };

  const findItemByItemId = (container: Container, id: string) => {
    return container.items.find(
      (item) => item.id === id
    );
  };

  const findItemIndexByItemId = (container: Container, id: string) => {
    const index = container.items.findIndex(
      (item) => item.id === id
    );
    return index !== -1 ? index : null 
  };

  const findItemTitleByItemId = (id: string) => {
    const container = findContainerByItemId(id);
    if (!container) return "";

    const item = container.items.find((item) => item.id === id);
    if (!item) return "";

    return item.title;
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [containers]);

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        collisionDetection={closestCorners}
        sensors={sensors}
      >
        <div className="d-flex">
          <DivContainer className="mt-3">
            <div>
              <h1 className="text-center">タイトル</h1>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button onClick={addNewContainer} className="btn btn-primary me-2" type="button">カードを追加</button>
              </div>
            </div>
            <div className="row row-cols-3 g-0 flex-fill">
              <SortableContext
                items={containers.map((container) => container.id)}
              >
                {containers.map((container) => (
                  <SortableContainer
                    key={container.id}
                    id={container.id}
                    container={container}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId && activeId.startsWith("item") && (
                  <Item title={findItemTitleByItemId(activeId)} handle={true} />
                )}
                {activeId && activeId.startsWith("container") && (
                  <OverlayContainer
                    id={activeId}
                    container={containers.find((c) => c.id === activeId)}
                  />
                )}
                {activeId && activeId.startsWith("new-item") && (
                  <Item title="new item" handle={false}  />
                )}
              </DragOverlay>
            </div>
          </DivContainer>
          <Sidebar count={count} />
        </div>
      </DndContext>
    </>
  );
}

export default App;
