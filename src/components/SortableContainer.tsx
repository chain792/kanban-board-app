// @ts-nocheck
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "react-bootstrap";
import { Container } from "../types/common";
import { RxDragHandleDots2 } from "react-icons/rx";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useContainersStore } from "../stores/containersStore";
import { useShallow } from "zustand/react/shallow";

interface Props {
  id: string;
  container: Container;
}

const SortableContainer = (props: Props) => {
  const items = props.container.items;

  const [removeContainer, updateContainerTitle] = useContainersStore(
    useShallow((state) => {
      return [state.removeContainer, state.updateContainerTitle];
    })
  );

  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? "0.4" : "1",
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.container.title);

  const handleRemoveContainer = () => {
    removeContainer(props.container.id);
  };

  const handleSaveTitle = () => {
    setIsEditing(false);
    updateContainerTitle(props.container.id, title);
  };

  return (
    <div className="px-2 mt-3">
      <Card className="border border-2 h-100" ref={setNodeRef} style={style}>
        <div className="card-body">
          {isEditing ? (
            <div>
              <div>
                <input
                  className="w-100 form-control"
                  value={title}
                  onInput={(e) => setTitle(e.target.value)}
                />
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
            <div className="d-flex justify-content-center">
              <h3 className="card-title text-center mx-auto">
                {props.container.title}
              </h3>
              <FaTrash className="me-3 fs-5 icon" onClick={handleRemoveContainer} />
              <FaEdit
                className="me-3 fs-5 icon"
                onClick={() => setIsEditing(true)}
              />
              <RxDragHandleDots2 className="fs-5 handle" {...listeners} />
            </div>
          )}
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} title={item.title} />
            ))}
          </SortableContext>
        </div>
      </Card>
    </div>
  );
};

export default SortableContainer;
