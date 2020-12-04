import {FlowElement} from 'react-flow-renderer'

import NodeModel from './NodeModel'

export interface RoadMap {
    id: string
    source?: string
    target?: string
    data?: {
        label: JSX.Element
        value: {
            id: string
            title: string
            description?: string
            progress?: number
            dueDate?: Date
            parent: string
        }
    }
    position?: {
        x: number
        y: number
    }
}

type Diff<T extends keyof any, U extends keyof any> = ({[P in T]: P} & {[P in U]: never} & {[x: string]: never})[T]
type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U

export type RoadMapNode = Overwrite<FlowElement, RoadMap>

export const findChildren = (id: string, elements: RoadMapNode[], includeEdge = false): RoadMapNode[] => {
    const childrenEdge = elements.filter((elm) => {
        const split = elm.id.split('-')
        return elm.id.includes('-') && split.length > 1 && split[0] === id
    })
    const children: RoadMapNode[] = []
    childrenEdge.forEach((edge) => {
        const foundChild = elements.find((elm) => elm.id === edge.id.split('-')[1])
        if (foundChild) children.push(foundChild)
    })
    if (includeEdge) return [...children, ...childrenEdge]
    return children
}

export const findParentById = (id: string, elements: RoadMapNode[]): RoadMapNode | undefined => {
    const parentEdge = elements.find((elm) => elm.id.includes('-') && elm.id.split('-')[1] === id)
    if (parentEdge) {
        const parent = elements.find((elm) => elm.id === parentEdge.id.split('-')[0])
        return parent
    }
    return undefined
}

export const filterCompletedChildren = (parentId: string) => (child: RoadMapNode): boolean => {
    if (child.data && child.data.value.progress === 100) return child.id !== parentId
    else return false
}

export const filterChildrenProgress = (parentId: string) => (child: RoadMapNode): boolean => {
    if (child.data && child.data.value.progress) return child.id !== parentId && !(child.data.value.progress === 100)
    else return false
}

export const getAllChildrenId = (
    id: string,
    allId: string[] = [],
    elements: RoadMapNode[] = [],
    includeEdge = false,
): string[] => {
    const children = findChildren(id, elements, includeEdge)
    if (children.length > 0) {
        const childrenId = children.map((child) => child.id)
        const all = children
            .filter((child) => !child.id.includes('-'))
            .map((child) => getAllChildrenId(child.id, childrenId, elements, includeEdge))
        if (all.length > 1) return all.reduce((value, current) => [...value, ...current])
        else return all[0]
    } else {
        return allId
    }
}

export const getAllChildren = (
    id: string,
    allChildren: RoadMapNode[] = [],
    elements: RoadMapNode[] = [],
    includeEdge = false,
): RoadMapNode[] => {
    const children = findChildren(id, elements, includeEdge)
    if (children.length > 0) {
        const all = children
            .filter((child) => !child.id.includes('-'))
            .map((child) => getAllChildren(child.id, children, elements, includeEdge))
        if (all.length > 1)
            return all.reduce((value, current) => [...value, ...current.filter((cur) => !value.includes(cur))])
        else return all[0]
    } else {
        return allChildren
    }
}

export const filterExcept = (idList: string[]) => (element: RoadMapNode): boolean => !idList.includes(element.id)

export const findParentEdge = (id: string) => (element: RoadMapNode): boolean => {
    console.log(id, element)
    return element.id.includes('-') && element.id.split('-')[1] === id
}

export const filterOneLevel = (level: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.y === level)

export const filterMyRightSide = (x: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.x > x)

export const filterMyLeftSide = (x: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.x < x)

export const reduceToModel = (nodeList: NodeModel[], node: RoadMapNode): NodeModel[] => {
    if (node.id.includes('-')) return nodeList
    return [
        ...nodeList,
        {
            id: node.id,
            description: node.data?.value.description || '',
            parent: '1',
            progress: node.data?.value.progress || 0,
            roadmapId: 1,
            title: node.data?.value.title || 'untitled',
            dueDate: node.data?.value.dueDate,
        },
    ]
}

export const convertToModel = (nodeList: RoadMap[]): NodeModel[] => {
    const finalNode: NodeModel[] = []
    nodeList.forEach((node) => {
        if (!node.id.includes('-')) {
            finalNode.push({
                parent: findParentById(node.id, nodeList)?.id || '0',
                description: node.data?.value.description || '',
                progress: node.data?.value.progress || 0,
                roadmapId: 1,
                title: node.data?.value.title || '',
                dueDate: node.data?.value.dueDate,
                id: node.id,
            })
        }
    })
    return finalNode
}

const findFirstDescent = (id: string, allNode: RoadMapNode[]): RoadMapNode | null => {
    const parent = findParentById(id, allNode)
    if (parent && !findParentById(parent.id, allNode)) {
        return parent
    } else if (parent) {
        return findFirstDescent(parent?.id, allNode)
    } else {
        return null
    }
}

const xTarget = (myX: number, nodeX: number, where: string): boolean => {
    switch (where) {
        case 'LEFT':
            return myX > nodeX
        case 'RIGHT':
            return myX < nodeX
        default:
            return true
    }
}

const filterNeighbor = (from: 'LEFT' | 'RIGHT' | 'ALL', y: number, x = 0) => (node: RoadMapNode): boolean => {
    return Boolean(node.position && node.position.y === y && xTarget(x, node.position.x, from))
}

const sortNodeByX = (firstNode: RoadMapNode, secondNode: RoadMapNode): number => {
    if (firstNode.position && secondNode.position) {
        return firstNode.position.x - secondNode.position.x
    } else {
        return 0
    }
}

export const getFirstNeighbor = (
    id: string,
    from: 'LEFT' | 'RIGHT',
    allNode: RoadMapNode[],
): {neighbor?: RoadMapNode; distance?: number} => {
    const node = allNode.find((nd) => nd.id === id)
    if (node && node.position) {
        const neighbor = allNode.filter(filterNeighbor(from, node.position.y, node.position.x))
        if (neighbor.length > 0) {
            neighbor.sort(sortNodeByX)
            if (neighbor[0].position) {
                const distance = Math.abs(neighbor[0].position.x - node.position.x)
                return {
                    neighbor: neighbor[0],
                    distance,
                }
            }
        }
    }
    return {}
}

export const moveNode = (to: 'LEFT' | 'RIGHT', distance: number, id: string, allNode: RoadMapNode[]): RoadMapNode[] => {
    const x = distance * (to === 'LEFT' ? -1 : 1)
    const coreNode = findFirstDescent(id, allNode)
    if (coreNode && coreNode.position) {
        const neighbor = allNode.filter(filterNeighbor(to, coreNode.position.y, coreNode.position.x))
        const movedNode: RoadMapNode[] = []
        for (const node of neighbor) {
            if (node.position) {
                movedNode.push({
                    ...node,
                    position: {
                        x: node.position.x + x,
                        y: node.position.y,
                    },
                })
            }
            const children = getAllChildren(node.id, [], allNode, false)
            for (const child of children) {
                if (child.position) {
                    movedNode.push({
                        ...child,
                        position: {
                            x: child.position.x + x,
                            y: child.position.y,
                        },
                    })
                }
            }
        }
        return movedNode
    }
    return []
}
