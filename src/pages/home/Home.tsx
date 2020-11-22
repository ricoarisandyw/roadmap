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

    const onClose = (): void => {
        setShowModal(false)
        setAction('')
        setSelectedElement(undefined)
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
                id: '0',
                position: {
                    x: 0,
                    y: 0,
                },
                data: {
                    label: <DefaultNode progress={20} type="GROUP" label="HEAVEN" onAction={onMenuSelected} />,
                    value: {
                        label: 'HEAVEN',
                        progress: 0,
                    },
                },
            },
        ])
    }, [])

    const findChildren = (id: string): FlowElement[] => {
        const childrenEdge = elements.filter((elm) => {
            const split = elm.id.split('-')
            return elm.id.includes('-') && split.length > 1 && split[0] === id
        })
        const children: FlowElement[] = []
        childrenEdge.forEach((edge) => {
            const foundChild = elements.find((elm) => elm.id === edge.id.split('-')[1])
            if (foundChild) children.push(foundChild)
        })
        return children
    }

    const findParentById = (id: string): FlowElement | undefined => {
        const parentEdge = elements.find((elm) => elm.id.includes('-') && elm.id.split('-')[1] === id)
        if (parentEdge) {
            const parent = elements.find((elm) => elm.id === parentEdge.id.split('-')[0])
            return parent
        }
        return undefined
    }

    const updateCheck = (): void => {
        // update parent first
        const element = selectedElement as {[key: string]: any}
        const parent = findParentById(element.id) as {[key: string]: any}
        const exceptSelectedAndParent = elements.filter((elm) => elm.id !== element.id && elm.id !== parent.id)

        const updatedNode = {
            ...element,
            id: element.id,
            data: {
                label: element.data.label,
                value: {
                    ...element.data.value.label,
                    checked: !element.data.value.checked,
                },
            },
            position: {
                x: element.position.x,
                y: element.position.y,
            },
        }

        if (parent) {
            const children = findChildren(parent.id)
            const completeChildren = children.filter((child) => {
                return child.data && child.data.value && child.data.value.checked && child.id !== element.id
            })
            const newProgress =
                ((completeChildren.length + (element.data.value.checked ? 0 : 1)) / children.length) * 100

            const updateParent = {
                ...parent,
                id: parent.id,
                data: {
                    label: (
                        <DefaultNode
                            type="GROUP"
                            progress={newProgress}
                            label={parent.data.value.label}
                            onAction={onMenuSelected}
                        />
                    ),
                    value: {
                        label: parent.data.value.label,
                        progress: newProgress,
                    },
                },
                position: {
                    x: parent.position.x,
                    y: parent.position.y,
                },
            }

            setElements([...exceptSelectedAndParent, updateParent, updatedNode])
        }
        onClose()
    }

    const realAction = (): void => {
        if (action === ActionType.ADD_CHECKLIST || action === ActionType.DETAIL) {
            setShowModal(true)
        } else if (action === ActionType.CHECK) {
            updateCheck()
        } else {
            window.alert(`Action ${action} will be available later`)
        }
    }

    const onSubmit = (value: FormNodeModel): void => {
        // avoid useEffect listener for selectedElement
        onClose()

        const element = selectedElement as {[key: string]: any}
        const exceptSelected = elements.filter((elm) => elm.id !== element.id)
        const children = findChildren(element.id)
        const completeChildren = children.filter(
            (child) => child.data && child.data.value && child.data.value.checked && child.id !== element.id,
        )
        const countChildren = children.length

        const newChildId = `${element.id}.${countChildren}`

        // when checklist has a child, it will become a group
        const renewalParent = {
            ...element,
            id: element?.id || '0',
            data: {
                label: (
                    <DefaultNode
                        type="GROUP"
                        progress={(completeChildren.length / (countChildren + 1)) * 100}
                        label={element?.data.value.label}
                        onAction={onMenuSelected}
                    />
                ),
                value: {
                    label: element?.data.value.label,
                    progress: 0,
                },
            },
            position: {
                x: element.position.x,
                y: element.position.y,
            },
        }

        const edge = {
            id: `${element.id}-${newChildId}`,
            source: element.id,
            target: newChildId,
            type: 'smoothstep',
        }

        if (element) {
            if (action === ActionType.ADD_CHECKLIST) {
                setElements([
                    ...exceptSelected,
                    renewalParent,
                    {
                        id: newChildId,
                        data: {
                            label: <DefaultNode type="CHECK" label={value.title} onAction={onMenuSelected} />,
                            value: {
                                label: value.title,
                                description: value.description,
                                checked: false,
                            },
                        },
                        position: {
                            x: element.position.x + 260 * Math.round(countChildren / 2) * (countChildren % 2 ? 1 : -1),
                            y: element.position.y + 140,
                        },
                    },
                    edge,
                ])
            }
        } else {
            console.error('Elemenet not found')
        }
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
                {action === ActionType.ADD_CHECKLIST ? <FormNode onSubmit={onSubmit} onClose={onClose} /> : null}
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
