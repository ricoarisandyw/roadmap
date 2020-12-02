import React from 'react'

import DefaultNode from '../components/DefaultNode/DefaultNode'

import {RoadMapNode} from './RoadmapNode'

export default interface NodeModel {
    id: string
    roadmapId: number
    title: string
    description: string
    dueDate?: Date
    label?: string
    progress: number
    parent: string
}

const findNodeById = (nodeId: string) => (node: NodeModel): boolean => node.id === nodeId

const filterNodeChildren = (nodeId: string) => (node: NodeModel): boolean => node.parent === nodeId

export const extractChildren = (nodeId: string, nodeList: NodeModel[], container: NodeModel[]): NodeModel[] => {
    const nodeChildren = nodeList.filter(filterNodeChildren(nodeId))
    if (nodeChildren.length > 0) {
        const all = nodeChildren.map((node) => extractChildren(node.id, nodeList, [...container, node]))
        return all.reduce((first, current) => [...first, ...current], [])
    } else {
        const foundNode = nodeList.find(findNodeById(nodeId))
        if (foundNode && !container.map((con) => con.id).includes(foundNode.id)) return [...container, foundNode]
        else return []
    }
}

export const generateChild = (
    currentChildList: RoadMapNode[],
    allNode: NodeModel[],
    parentId: string,
    parentX = 0,
    parentLevel = 1,
): RoadMapNode[] => {
    const parent = allNode.find((node) => node.id === parentId)
    const children = allNode.filter(filterNodeChildren(parentId))

    if (children.length > 0) {
        return children
            .map((child, i) =>
                generateChild(
                    [
                        ...currentChildList,
                        {
                            id: `${parent?.id}-${child.id}`,
                            source: parent?.id,
                            target: child.id,
                        },
                        {
                            id: child.id,
                            data: {
                                label: (
                                    <DefaultNode
                                        type={
                                            allNode.filter(filterNodeChildren(child.id)).length > 0 ? 'GROUP' : 'CHECK'
                                        }
                                        title={child.title}
                                        progress={child.progress}
                                    />
                                ),
                                value: {
                                    id: child.id,
                                    parent: parentId,
                                    title: child.title,
                                    description: child.description,
                                    dueDate: child.dueDate,
                                    progress: child.progress,
                                },
                            },
                            position: {
                                x: parentX + i * 260,
                                y: parentLevel * 140,
                            },
                        },
                    ],
                    allNode,
                    child.id,
                    parentX + i * 260,
                    parentLevel + 1,
                ),
            )
            .reduce((container, current) => [...container, ...current], [])
        // } else if (parent && !currentChildList.find((node) => node.id === parent.id)) {
        //     return [
        //         ...currentChildList,
        //         {
        //             id: parent.id,
        //             data: {
        //                 label: <div>No Child {parent.title}</div>,
        //                 value: {
        //                     id: parent.id,
        //                     parent: parentId,
        //                     title: parent.title,
        //                     description: parent.description,
        //                     dueDate: parent.dueDate,
        //                     progress: parent.progress,
        //                 },
        //             },
        //             position: {
        //                 x: 260,
        //                 y: parentLevel * 140,
        //             },
        //         },
        //     ]
    } else {
        return currentChildList
    }
}

export const convertNodeToFlow = (nodeList: NodeModel[]): RoadMapNode[] => {
    const roadmapList: RoadMapNode[] = []

    const grandParent = nodeList.find(findNodeById('1'))
    if (grandParent) {
        roadmapList.push({
            id: grandParent?.id,
            data: {
                label: <DefaultNode title={grandParent.title} progress={grandParent?.progress} type="GROUP" />,
                value: {
                    id: grandParent?.id,
                    title: grandParent?.title,
                    description: grandParent?.description,
                    progress: grandParent?.progress,
                    dueDate: grandParent?.dueDate,
                    parent: '',
                },
            },
            position: {
                x: 0,
                y: 0,
            },
        })

        generateChild([], nodeList, grandParent.id).forEach((node) => roadmapList.push(node))
    }

    return roadmapList
}
