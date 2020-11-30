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
import {useDispatch, useSelector} from 'react-redux'

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
    mapToModel,
    RoadMapNode,
} from '../../model/RoadmapNode'
import {convertNodeToFlow} from '../../model/NodeModel'
import {RootState} from '../../redux/reducers'
import {ActionState} from '../../redux/reducers/ActionReducers'
import {updateAction} from '../../redux/actions/ActionActions'

import {NodeSeed} from './DataSeed'

const WIDTH = 260
const HEIGHT = 140

const onLoad = (reactFlowInstance: OnLoadParams): void => {
    reactFlowInstance.fitView()
}

const Home: React.FC = () => {
    const dispatch = useDispatch()

    const {action} = useSelector<RootState, ActionState>((state) => state.action)

    const [elements, setElements] = useState<RoadMapNode[]>([])
    const [selectedElement, setSelectedElement] = useState<RoadMapNode>()
    const [showModal, setShowModal] = useState(false)

    const onClose = (): void => {
        setShowModal(false)
        dispatch(updateAction(''))
        setSelectedElement(undefined)
    }

    const onElementsRemove = (elementsToRemove: Elements): void =>
        setElements((els) => removeElements(elementsToRemove, els as FlowElement[]))

    const onConnect = (params: Edge | Connection): void => setElements((els) => addEdge(params, els as FlowElement[]))

    const onElementClick = (event: React.MouseEvent<Element, MouseEvent>, element: FlowElement): void => {
        setSelectedElement(element)
    }

    useEffect(() => {
        const roadmapData = localStorage.getItem('roadmap_data')
        if (roadmapData) {
            console.log(roadmapData)
            setElements(
                (JSON.parse(roadmapData) as RoadMapNode[]).map((node) => ({
                    ...node,
                    position: {
                        x: 0,
                        y: 0,
                    },
                })),
            )
        } else {
            const initialValue = convertNodeToFlow(NodeSeed)

            setElements(initialValue)
        }
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
                    label: <DefaultNode type="GROUP" progress={newProgress} title={parent.data.value.label} />,
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
            dispatch(updateAction(ActionType.UPDATE_NODE))
        }
    }

    const deleteNode = (): void => {
        const element = selectedElement as RoadMapNode
        const parentEdge = (elements as FlowElement[]).find(findParentEdge(element.id)) as RoadMapNode
        console.log('DELETE NODE', element.id, getAllChildren(element.id, [], elements), parentEdge)
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

        let biggestId
        if (children.length > 1)
            biggestId = children.reduce((prev, current) => {
                if (parseInt(prev.id, 10) > parseInt(current.id, 10)) {
                    return prev
                } else {
                    return current
                }
            }).id
        else if (children.length === 1) biggestId = children[0].id
        else biggestId = 0

        // check if crashed or not
        const newY = (element.position?.y || 0) + HEIGHT

        const findPosition = (x: number, y: number) => (elm: RoadMapNode): boolean => {
            if (elm.position && elm.position.y === y && x === elm.position.x) return true
            else return false
        }
        const filterExceptEdge = (elm: RoadMapNode): boolean => !elm.id.includes('-')

        const elementsExceptEdge = elements.filter(filterExceptEdge)

        const AbsParse = (id: string): number => Math.abs(parseInt(id, 10))

        // find from 0
        let movedX = 0
        for (let i = 1; i < Infinity; i++) {
            // realZero means one line vertically
            const realZero = movedX + (element.position?.x || 0)
            const crashed = elementsExceptEdge.find(findPosition(realZero, newY))
            if (crashed) {
                movedX += WIDTH * i * (i % 2 ? 1 : -1)
                // find priority
                // if my id < parent id of detected crash id then I will be prioritized
                const crashedParent = findParentById(crashed.id, elements)
                // after found priority then find out prioritized position
                if (crashedParent && AbsParse(element.id) < AbsParse(crashed.id)) {
                    movedX += WIDTH
                    setSelectedElement(crashedParent)
                    if (parseInt(element.id, 10) < parseInt(crashed.id, 10))
                        dispatch(updateAction(ActionType.MOVE_RIGHT))
                    else dispatch(updateAction(ActionType.MOVE_LEFT))
                } else if (parseInt(element.id, 10) < parseInt(crashed.id, 10))
                    dispatch(updateAction(ActionType.MOVE_RIGHT))
                else dispatch(updateAction(ActionType.MOVE_LEFT))
                // use position to move element
            } else {
                i = Infinity
            }
        }
        movedX += element.position?.x || 0

        const newChildId = `${element.id}.${biggestId}`

        // when checklist has a child, it will become a group
        const renewalParent: RoadMapNode = {
            ...element,
            data: {
                label: (
                    <DefaultNode
                        type="GROUP"
                        progress={(completeChildren.length / (countChildren + 1)) * 100}
                        title={element.data?.value.title || ''}
                    />
                ),
                value: {
                    id: element.id,
                    title: element.data?.value.title || '-',
                    progress: 0,
                    parent: element.data?.value.parent || '',
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
                            label: <DefaultNode type="CHECK" title={value.title} />,
                            value: {
                                id: renewalParent.id,
                                title: value.title,
                                description: value.description,
                                checked: false,
                                parent: renewalParent.id,
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

    const onSave = (): void => {
        localStorage.setItem('roadmap_data', JSON.stringify(elements.map(mapToModel)))
        window.alert('Element Saved')
    }

    const onDelete = (): void => {
        localStorage.removeItem('roadmap_data')
        window.alert('Element Deleted')
    }

    return (
        <div className="Home fullscreen m-5">
            <div>
                Toolbar :
                <div className="d-flex">
                    <button className="btn btn-success" onClick={onSave}>
                        SAVE
                    </button>
                    <button className="btn btn-danger" onClick={onDelete}>
                        DELETE
                    </button>
                </div>
            </div>
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
