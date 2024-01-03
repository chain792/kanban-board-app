import { Card } from "react-bootstrap";
import { Container } from "../types/common";
import Item from "./Item";
import { RxDragHandleDots2 } from "react-icons/rx";

interface Props {
  id: string;
  container: Container | undefined;
}

const Container = (props: Props) => {
  if (!props.container) return null;

  const items = props.container.items;

  return (
    <div className="h-100">
      <Card className="border border-2 h-100">
        <div className="card-body">
          <div className="d-flex justify-content-center">
            <h3 className="card-title text-center mx-auto">
              {props.container.title}
            </h3>

            <RxDragHandleDots2 className="fs-5 handle" />
          </div>
          {items.map((item) => (
            <Item key={item.id} title={item.title} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Container;
