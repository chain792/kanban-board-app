import { useDroppable } from "@dnd-kit/core";
import DraggableNewItem from "./DraggableNewItem";

const Sidebar = (props) => {
  const { setNodeRef } = useDroppable({
    id: "sidebar-droppable",
  });

  return (
    <div className="bg-light vh-100" style={{ width: "300px" }}>
      <div ref={setNodeRef} className="mt-5" style={{top: '150px'}}>
        <div>
          <h5 className="text-center">新しいタスク</h5>
        </div>
        <div className="mt-3">
          <DraggableNewItem id={`new-item-${props.count}`} title="new task" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
