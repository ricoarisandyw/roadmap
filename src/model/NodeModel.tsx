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

        console.log('Extract Children', extractChildren(grandParent.id, nodeList, []))

        // it just for first y
        nodeList.filter(filterNodeChildren(grandParent.id)).forEach((child, i) => {
            const nodeChild = child as NodeModel
            roadmapList.push({
                id: child.id,
                data: {
                    label: (
                        <DefaultNode
                            title={nodeChild.title || '-'}
                            type={nodeList.filter(filterNodeChildren(child.id)).length > 0 ? 'GROUP' : 'CHECK'}
                            progress={nodeChild.progress}
                        />
                    ),
                    value: {
                        id: child.id,
                        title: nodeChild.title || '',
                        dueDate: nodeChild.dueDate,
                        description: nodeChild.description,
                        progress: nodeChild.progress,
                        parent: grandParent.id,
                    },
                },
                position: {
                    x: 0 + i * 260,
                    y: 140,
                },
            })
            roadmapList.push({
                id: `${grandParent.id}-${child.id}`,
                source: child.parent,
                target: child.id,
            })
        })
    }

    console.log('Roadmap List', roadmapList)
    return roadmapList
}
