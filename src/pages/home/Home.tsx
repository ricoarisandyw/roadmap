import React, {useEffect, useState} from 'react'
import './Home.scss'
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
} from 'react-flow-renderer'

import DetailNode from '../../components/DetailNode/DetailNode'
import DefaultNode from '../../components/DefaultNode/DefaultNode'
import ActionType from '../../components/DefaultNode/ActionType'
import FormNode, {FormNodeModel} from '../../components/FormNode/FormNode'

const onLoad = (reactFlowInstance: OnLoadParams): void => {
    reactFlowInstance.fitView()
}

const Home: React.FC = () => {
    const [elements, setElements] = useState<FlowElement[]>([])
    const [selectedElement, setSelectedElement] = useState<FlowElement>()
    const [action, setAction] = useState('')
    const [showModal, setShowModal] = useState(false)

    const onMenuSelected = (actionType: string): void => {
        setAction(actionType)
    }

    const onElementsRemove = (elementsToRemove: Elements): void =>
        setElements((els) => removeElements(elementsToRemove, els))
    const onConnect = (params: Edge | Connection): void => setElements((els) => addEdge(params, els))

    const onElementClick = (event: React.MouseEvent<Element, MouseEvent>, element: FlowElement): void => {
        setSelectedElement(element)
    }

    useEffect(() => {
        setElements([
            {
                id: '1',
                position: {
                    x: 0,
                    y: 0,
                },
                data: {
                    label: <DefaultNode label="1" onMenuSelected={onMenuSelected} />,
                },
            },
        ])
    }, [])

    const realAction = (): void => {
        if (action === ActionType.ADD_CHECKLIST || action === ActionType.ADD_GROUP || action === ActionType.DETAIL) {
            setShowModal(true)
        } else {
            window.alert(`Action ${action} will be available later`)
        }
    }

    const onClose = (): void => {
        setShowModal(false)
        setAction('')
        setSelectedElement(undefined)
    }

    const onSubmit = (value: FormNodeModel): void => {
        const element = selectedElement as {[key: string]: any}
        if (action === ActionType.ADD_CHECKLIST) {
            setElements([
                ...elements,
                {
                    id: (elements.length + 1).toString(),
                    data: {
                        label: <DefaultNode label={value.title} onMenuSelected={onMenuSelected} />,
                    },
                    position: {
                        x: element.position.x,
                        y: element.position.y + 140,
                    },
                },
                {
                    id: `e${(elements.length + 1).toString()}`,
                    source: selectedElement?.id.toString() || '',
                    target: (elements.length + 1).toString(),
                    type: 'smoothstep',
                },
            ])
        } else if (action === ActionType.ADD_GROUP) {
            setElements([
                ...elements,
                {
                    id: (elements.length + 1).toString(),
                    data: {
                        label: <DefaultNode label={value.title} onMenuSelected={onMenuSelected} />,
                    },
                    position: {
                        x: element.position.x + 260,
                        y: element.position.y,
                    },
                },
                {
                    id: `e${(elements.length + 1).toString()}`,
                    source: selectedElement?.id.toString() || '',
                    target: (elements.length + 1).toString(),
                    type: 'smoothstep',
                },
            ])
        }

        onClose()
    }

    useEffect(() => {
        // trigger action here
        console.log(selectedElement, action)
        if (selectedElement && action !== '') realAction()
    }, [selectedElement, action])

    return (
        <div className="Home fullscreen m-5">
            <div className={['modal fade', showModal ? 'show' : 'd-none'].join(' ')}>
                {selectedElement && action === ActionType.DETAIL ? (
                    <DetailNode node={selectedElement} onClose={onClose} />
                ) : (
                    ''
                )}
                {action === ActionType.ADD_CHECKLIST || action === ActionType.ADD_GROUP ? (
                    <FormNode onSubmit={onSubmit} onClose={onClose} />
                ) : null}
            </div>
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
    )
}

export default Home
