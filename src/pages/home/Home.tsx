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
    findChildren,
    findParentById,
    getAllChildrenId,
} from '../../model/RoadmapNode'

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

    const updateNode = (): void => {
        const foundParent = selectedElement ? findParentById(selectedElement.id, elements) : null

        if (foundParent) {
            const parent = foundParent as any
            const exceptParent = elements.filter((elm) => parent.id !== elm.id)

            const children = findChildren(parent.id, elements)
            const completeChildren = children.filter(filterCompletedChildren(parent.id))
            const childrenProgress = children
                .filter(filterChildrenProgress(parent.id))
                .map((child) => child.data.value.progress / children.length)

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
            setElements([...exceptParent, updatedNode])

            setSelectedElement(parent)
        } else {
            onClose()
        }
    }

    const updateCheck = (): void => {
        // update parent first
        const element = selectedElement as {[key: string]: any}
        const exceptSelected = elements.filter((elm) => elm.id !== element.id)

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

        setElements([...exceptSelected, updatedNode])
        setAction(ActionType.UPDATE_NODE)
    }

    const deleteNode = (): void => {
        const element = selectedElement as any
        const exceptChildren = elements.filter(
            filterExcept([element.id, ...getAllChildrenId(element.id, [], elements)]),
        )

        setElements(exceptChildren)
        onClose()
    }

    const onSubmit = (value: FormNodeModel): void => {
        // avoid useEffect listener for selectedElement
        onClose()

        const element = selectedElement as {[key: string]: any}
        const exceptSelected = elements.filter((elm) => elm.id !== element.id)
        const children = findChildren(element.id, elements)
        const completeChildren = children.filter(filterCompletedChildren(element.id))
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

    const collapse = (): void => {
        const element = selectedElement as any
        const exceptChildren = elements.filter(filterExcept([...getAllChildrenId(element.id, [], elements)]))

        setElements(exceptChildren)
        onClose()
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
