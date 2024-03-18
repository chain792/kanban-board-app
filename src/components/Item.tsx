// @ts-nocheck
import { Card } from "react-bootstrap";
import { RxDragHandleDots2 } from "react-icons/rx";

interface Props {
  title: string;
}

const Item = (props: Props) => {

  return (
    <Card body className="m-3">
      <div className="d-flex">
        <div className="flex-fill">{props.title}</div>
          {props.handle ? <RxDragHandleDots2 className="fs-5 handle" /> : null}
      </div>
    </Card>
  );
};

export default Item;
