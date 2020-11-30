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
                    checked: grandParent?.progress === 100,
                    dueDate: grandParent?.dueDate,
                    parent: '',
                },
            },
            position: {
                x: 0,
                y: 0,
            },
        })

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
                            checked={Boolean(nodeChild.progress)}
                            progress={nodeChild.progress}
                        />
                    ),
                    value: {
                        id: child.id,
                        title: nodeChild.title || '',
                        checked: nodeChild.progress === 100,
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
