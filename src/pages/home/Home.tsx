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

  return (
    <div className="fullscreen">
        <ReactFlow
            elements={elements}
            onElementsRemove={onElementsRemove}
            onConnect={onConnect}
            onLoad={onLoad}
            snapToGrid={true}
            snapGrid={[15, 15]}
        >
            <MiniMap
            nodeStrokeColor={(n) => {
                if (n.style?.background) return n.style.background as string;
                if (n.type === 'input') return '#0041d0';
                if (n.type === 'output') return '#ff0072';
                if (n.type === 'default') return '#1a192b';
                return '#eee';
            }}
            nodeColor={(n) => {
                if (n.style?.background) return n.style.background as string;
                return '#fff';
            }}
            nodeBorderRadius={2}
            />
            <Controls />
            <Background color="#aaa" gap={16} />
        </ReactFlow>
    </div>
  );
};

export default Home;