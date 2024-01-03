import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "react-bootstrap";

interface Props {
  id: string;
  title: string;
}

const DraggableNewItem = (props: Props) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: props.id,
  });

  const style = {
    opacity: isDragging ? "0.4" : "1",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="m-3">
        <div className="card-body">
            {props.title}
        </div>
      </Card>
    </div>
  );
};

export default DraggableNewItem;
