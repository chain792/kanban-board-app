import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useContainersStore } from "../stores/containersStore";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";

interface Props {
  id: string;
  title: string;
}

const SortableItem = (props: Props) => {
  const [containers, removeItem, updateItemTitle] = useContainersStore(
    useShallow((state) => {
      return [state.containers, state.removeItem, state.updateItemTitle];
    })
  );

  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.title)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? "0.4" : "1",
  };

  const findContainerByItemId = (id: string) => {
    return containers.find((container) =>
      container.items.some((item) => item.id === id)
    );
  };

  const handleRemoveItem = () => {
    const container = findContainerByItemId(props.id);
    if (!container) return;

    const itemIndex = container.items.findIndex((item) => item.id === props.id);
    if (itemIndex === -1) return;
    removeItem(container.id, itemIndex);
  };

  const handleSaveTitle = () => {
    const container = findContainerByItemId(props.id);
    if (!container) return;

    const itemIndex = container.items.findIndex((item) => item.id === props.id);
    if (itemIndex === -1) return;

    setIsEditing(false)
    updateItemTitle(container.id, itemIndex, title)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="m-3">
        <div className="card-body">
          {isEditing ? (
            <div>
              <div>
                <input className="w-100  form-control" value={title} onInput={(e) => setTitle(e.target.value)}  />
              </div>
              <div className="d-flex mt-3">
                <div className="ms-auto">
                  <button
                    className="btn btn-secondary btn-sm me-3"
                    onClick={() => setIsEditing(false)}
                  >
                    キャンセル
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleSaveTitle}
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex">
              <div className="flex-fill">{props.title}</div>
              <FaTrash className="me-3 fs-5 icon" onClick={handleRemoveItem} />
              <FaEdit
                className="me-3 fs-5 icon"
                onClick={() => setIsEditing(true)}
              />
              <RxDragHandleDots2
                className="fs-5 handle"
                {...listeners}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SortableItem;
