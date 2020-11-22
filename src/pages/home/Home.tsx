import React, { useEffect, useState } from 'react';

import ReactFlow, {
  removeElements,
  addEdge,
  Controls,
  Background,
  Elements,
  Edge,
  Connection,
  OnLoadParams,
  FlowElement,
} from 'react-flow-renderer';
import DefaultNode from '../../components/DefaultNode/DefaultNode';

const onLoad = (reactFlowInstance: OnLoadParams): void => {
  reactFlowInstance.fitView();
};

const Home: React.FC = () => {
  const [elements, setElements] = useState<FlowElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FlowElement>() 
  const [action, setAction] = useState("")

  const onAddHorizontal = (): void => {
    setAction("ADD_HORIZONTAL")
  }

  const onAddVertical = (): void => {
    setAction("ADD_VERTICAL")
  }

  const onElementsRemove = (elementsToRemove: Elements): void => setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params: Edge | Connection): void => setElements((els) => addEdge(params, els));

  const onElementClick = (event: React.MouseEvent<Element, MouseEvent>, element: FlowElement): void => {
    setSelectedElement(element)
  }

  useEffect(()=>{
    setElements([{
      id: "1",
      position: {
          x: 0,
          y: 0,
      },
      data: {
        label: (
          <DefaultNode label="1" onAddHorizon={onAddHorizontal} onAddVertical={onAddVertical} />
        )
      }
  }])
  }, [])

  const realAction = (): void => {
    const element = selectedElement as {[key: string]: any}
    if(action === "ADD_HORIZONTAL")
      setElements([
        ...elements,
        {
          id: (elements.length + 1).toString(),
          data: {
            label: <DefaultNode label={(elements.length + 1) + " child of "+selectedElement?.id} onAddHorizon={onAddHorizontal} onAddVertical={onAddVertical} />
          },
          position: {
            x: element['position'].x + 200,
            y: element['position'].y,
          }
        }
      ])
    else if (action === "ADD_VERTICAL")
      setElements([
        ...elements,
        {
          id: (elements.length + 1).toString(),
          data: {
            label: <DefaultNode label={(elements.length + 1) + " child of "+selectedElement?.id} onAddHorizon={onAddHorizontal} onAddVertical={onAddVertical} />
          },          
          position: {
            x: element['position'].x,
            y: element['position'].y + 200,
          },
          style: {
            width: "500px"
          }
        }
      ])

    setSelectedElement(undefined)
    setAction("")
  }

  useEffect(() => {
    // trigger action here
    if (selectedElement) realAction()
  }, [selectedElement])

  return (
    <div className="fullscreen m-5">
      <ReactFlow
          elements={elements}
          onElementsRemove={onElementsRemove}
          onConnect={onConnect}
          onLoad={onLoad}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onElementClick={onElementClick}
          nodesDraggable={false}
          nodesConnectable={false}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default Home;