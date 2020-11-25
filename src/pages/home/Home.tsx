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
import {
    filterChildrenProgress,
    filterCompletedChildren,
    filterExcept,
    filterMyLeftSide,
    filterMyRightSide,
    filterOneLevel,
    findChildren,
    findParentById,
    findParentEdge,
    getAllChildren,
    getAllChildrenId,
    RoadMapNode,
} from '../../model/RoadmapNode'

const WIDTH = 260
const HEIGHT = 140

const onLoad = (reactFlowInstance: OnLoadParams): void => {
    reactFlowInstance.fitView()
}

const Home: React.FC = () => {
    const [elements, setElements] = useState<RoadMapNode[]>([])
    const [selectedElement, setSelectedElement] = useState<RoadMapNode>()
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
        setElements((els) => removeElements(elementsToRemove, els as FlowElement[]))

    const onConnect = (params: Edge | Connection): void => setElements((els) => addEdge(params, els as FlowElement[]))

    const onElementClick = (event: React.MouseEvent<Element, MouseEvent>, element: FlowElement): void => {
        setSelectedElement(element)
    }

    useEffect(() => {
        const initialValue: RoadMapNode = {
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
        }

        setElements([initialValue])
    }, [])

    const updateNode = (): void => {
        const foundParent = selectedElement ? findParentById(selectedElement.id, elements) : null

        if (foundParent) {
            const parent = foundParent as any
            const exceptParent = elements.filter((elm) => parent.id !== elm.id)

            const children = findChildren(parent.id, elements)
            const completeChildren = children.filter(filterCompletedChildren(parent.id))
            const childrenProgress = children
                .filter(filterChildrenProgress(parent.id))
                .map((child) => (child.data?.value.progress || 0) / children.length)

            const countProgress = (): number => {
                if (childrenProgress.length > 1)
                    return childrenProgress.reduce((value, currentValue) => value + currentValue)
                else if (childrenProgress.length === 1) return childrenProgress[0]
                else return 0
            }
            const progressFromCheck = (completeChildren.length / children.length) * 100
            const newProgress = progressFromCheck + countProgress()
            const updatedNode = {
                ...parent,
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
            }
            setElements([...exceptParent, updatedNode])

            setSelectedElement(parent)
        } else {
            onClose()
        }
    }

    const updateCheck = (): void => {
        // update parent first
        const element = selectedElement as RoadMapNode
        const exceptSelected = elements.filter((elm) => elm.id !== element.id)

        if (element.data) {
            const updatedNode = {
                ...element,
                data: {
                    label: element.data.label,
                    value: {
                        ...element.data.value,
                        checked: !element.data?.value.checked,
                    },
                },
            }

            setElements([...exceptSelected, updatedNode])
            setAction(ActionType.UPDATE_NODE)
        }
    }

    const deleteNode = (): void => {
        const element = selectedElement as RoadMapNode
        const parentEdge = (elements as FlowElement[]).find(findParentEdge(element.id)) as RoadMapNode
        const exceptChildren = (elements as FlowElement[]).filter(
            filterExcept([element.id, ...getAllChildrenId(element.id, [], elements as FlowElement[]), parentEdge.id]),
        )

        setElements(exceptChildren)
        onClose()
    }

    const onSubmit = (value: FormNodeModel): void => {
        // avoid useEffect listener for selectedElement
        onClose()

        const element = selectedElement as RoadMapNode
        const exceptSelected = elements.filter((elm) => elm.id !== element.id)
        const children = findChildren(element.id, elements as FlowElement[])
        const completeChildren = children.filter(filterCompletedChildren(element.id))
        const countChildren = children.length

        // check if crashed or not
        const moveTo = countChildren % 2 ? 1 : -1
        const newX = (element.position?.x || 0) + WIDTH * Math.round(countChildren / 2) * moveTo
        const newY = (element.position?.y || 0) + HEIGHT

        const findPosition = (x: number, y: number) => (elm: RoadMapNode): boolean => {
            if (elm.position) return elm.position.y === y && x === elm.position.x
            else return false
        }
        const filterExceptEdge = (elm: RoadMapNode): boolean => !elm.id.includes('-')

        const elementsExceptEdge = elements.filter(filterExceptEdge)

        let movedX = newX
        for (let i = 1; i < Infinity; i++) {
            if (elementsExceptEdge.find(findPosition(movedX, newY))) {
                movedX += WIDTH * i * moveTo
            } else {
                i = Infinity
            }
        }

        const newChildId = `${element.id}.${countChildren}`

        // when checklist has a child, it will become a group
        const renewalParent = {
            ...element,
            data: {
                label: (
                    <DefaultNode
                        type="GROUP"
                        progress={(completeChildren.length / (countChildren + 1)) * 100}
                        label={element.data?.value.label || ''}
                        onAction={onMenuSelected}
                    />
                ),
                value: {
                    label: element.data?.value.label || '',
                    progress: 0,
                },
            },
        }

        const edge = {
            id: `${element.id}-${newChildId}`,
            source: element.id,
            target: newChildId,
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
                            x: movedX,
                            y: newY,
                        },
                    },
                    edge,
                ])
            }
        } else {
            console.error('Elemenet not found')
        }
    }

    const collapse = (): void => {
        const element = selectedElement as any
        const updatedElement = {
            ...element,
            id: element.id,
            data: {
                ...element.data,
                value: {
                    ...element.data.value,
                    isHidden: !element.data.value.isHidden,
                },
            },
            position: element.position,
        }

        const exceptChildrenAndElement = elements.filter(
            filterExcept([...getAllChildrenId(element.id, [], elements, true), element.id]),
        )
        const allChildren = getAllChildren(element.id, [], elements, true)
        const updatedChildren = allChildren.map((elm) => ({
            ...elm,
            id: elm.id,
            isHidden: !element.data.value.isHidden,
            position: (elm as any).position,
        }))

        setElements([...exceptChildrenAndElement, ...updatedChildren, updatedElement])
        onClose()
    }

    const move = (actionType: string): void => {
        let moveTo = 0
        if (actionType === ActionType.MOVE_RIGHT) moveTo = 1
        else moveTo = -1

        if (selectedElement && selectedElement.position) {
            const neighborNode = [
                selectedElement,
                ...elements
                    .filter(filterOneLevel(selectedElement.position.y))
                    .filter(
                        moveTo
                            ? filterMyRightSide(selectedElement.position.x)
                            : filterMyLeftSide(selectedElement.position.x),
                    ),
            ]
            const exceptNeighbor = elements.filter(filterExcept(neighborNode.map((node) => node.id)))
            const updatedNode = neighborNode.map((node) => ({
                ...node,
                position: {
                    x: (node.position?.x || 0) + WIDTH * moveTo,
                    y: node.position?.y || 0,
                },
            }))

            setElements([...exceptNeighbor, ...updatedNode])
            onClose()
        }
    }

    const realAction = (): void => {
        if (action === ActionType.ADD_CHECKLIST || action === ActionType.DETAIL) {
            setShowModal(true)
        } else if (action === ActionType.CHECK) {
            updateCheck()
        } else if (action === ActionType.UPDATE_NODE) {
            updateNode()
        } else if (action === ActionType.DELETE) {
            if (confirm('Are you sure want to delete this item?')) deleteNode()
            else onClose()
        } else if (action === ActionType.COLLAPSE) {
            collapse()
        } else if (action === ActionType.MOVE_LEFT || action === ActionType.MOVE_RIGHT) {
            move(action)
        } else {
            window.alert(`Action ${action} will be available later`)
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
                elements={elements as FlowElement[]}
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
