import React, { useState } from 'react';

import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Elements,
  Edge,
  Connection,
  OnLoadParams,
  FlowElement,
} from 'react-flow-renderer';
import initialElements from './FlowSeed';

const onLoad = (reactFlowInstance: OnLoadParams) => {
  console.log('flow loaded:', reactFlowInstance);
  reactFlowInstance.fitView();
};

const Home: React.FC = () => {
  const [elements, setElements] = useState(initialElements);

  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params: Edge | Connection) => setElements((els) => addEdge(params, els));

  const onElementClick = (event: React.MouseEvent<Element, MouseEvent>, element: FlowElement) => {
    console.log(event, element)
    setElements([
        ...elements,
        {
         ...elements[0],
         id: elements.length.toString(),
         position: { x: 150, y: 0 },
        }
    ])
  }

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