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

  const onMenuSelected = (action: string): void => {
    setAction(action)
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
          <DefaultNode label="1" onMenuSelected={onMenuSelected} />
        )
      }
  }])
  }, [])

  const realAction = (): void => {
    const element = selectedElement as {[key: string]: any}
    console.log(element['position'], action)
    if(action === "ADD_GROUP")
      setElements([
        ...elements,
        {
          id: (elements.length + 1).toString(),
          data: {
            label: <DefaultNode label={(elements.length + 1) + " child of "+selectedElement?.id} onMenuSelected={onMenuSelected} />
          },          
          position: {
            x: element['position'].x + 260,
            y: element['position'].y,
          },
        },
        {
          id: "e" +(elements.length + 1).toString(),
          source: selectedElement?.id.toString() || "",
          target: (elements.length + 1).toString(),
          type: 'smoothstep',
        }
      ])
    else if (action === "ADD_CHECKLIST")
      setElements([
        ...elements,
        {
          id: (elements.length + 1).toString(),
          data: {
            label: <DefaultNode label={(elements.length + 1) + " child of "+selectedElement?.id} onMenuSelected={onMenuSelected} />
          },          
          position: {
            x: element['position'].x,
            y: element['position'].y + 140,
          },
        },
        {
          id: "e" + (elements.length + 1).toString(),
          source: selectedElement?.id.toString() || "",
          target: (elements.length + 1).toString(),
          type: 'smoothstep',
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