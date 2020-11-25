import {FlowElement} from 'react-flow-renderer'

export interface RoadMap {
    id: string
    source?: string
    target?: string
    data?: {
        label: JSX.Element
        value: {
            label: string
            description?: string
            progress?: number
            checked?: boolean
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
    if (child.data && child.data.value.checked) return child.id !== parentId
    else return false
}

export const filterChildrenProgress = (parentId: string) => (child: RoadMapNode): boolean => {
    if (child.data && child.data.value.progress) return child.id !== parentId && !child.data.value.checked
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
    return element.id.includes('-') && element.id.split('-')[1] === id
}

export const filterOneLevel = (level: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.y === level)

export const filterMyRightSide = (x: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.x > x)

export const filterMyLeftSide = (x: number) => (element: RoadMapNode): boolean =>
    Boolean(element.position && element.position.x < x)
