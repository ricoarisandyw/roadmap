import {FlowElement} from 'react-flow-renderer'

export const findChildren = (id: string, elements: FlowElement[], includeEdge = false): FlowElement[] => {
    const childrenEdge = elements.filter((elm) => {
        const split = elm.id.split('-')
        return elm.id.includes('-') && split.length > 1 && split[0] === id
    })
    const children: FlowElement[] = []
    childrenEdge.forEach((edge) => {
        const foundChild = elements.find((elm) => elm.id === edge.id.split('-')[1])
        if (foundChild) children.push(foundChild)
    })
    if (includeEdge) return [...children, ...childrenEdge]
    return children
}

export const findParentById = (id: string, elements: FlowElement[]): FlowElement | undefined => {
    const parentEdge = elements.find((elm) => elm.id.includes('-') && elm.id.split('-')[1] === id)
    if (parentEdge) {
        const parent = elements.find((elm) => elm.id === parentEdge.id.split('-')[0])
        return parent
    }
    return undefined
}

export const filterCompletedChildren = (parentId: string) => (child: FlowElement): boolean =>
    child.data && child.data.value && child.data.value.checked && child.id !== parentId

export const filterChildrenProgress = (parentId: string) => (child: FlowElement): boolean =>
    // edge don't have data
    child.data &&
    // edge don't have value
    child.data.value &&
    // type check don't have progress
    child.data.value.progress &&
    // children not include this
    child.id !== parentId &&
    // checkbox which level up to group still have checked
    !child.data.value.checked

export const getAllChildrenId = (
    id: string,
    allId: string[] = [],
    elements: FlowElement[] = [],
    includeEdge = false,
): string[] => {
    const children = findChildren(id, elements, includeEdge)
    if (children.length > 0) {
        const childrenId = children.map((child) => child.id)
        const all = children.map((child) => getAllChildrenId(child.id, childrenId, elements))
        if (all.length > 1) return all.reduce((value, current) => [...value, ...current])
        else return all[0]
    } else {
        return allId
    }
}

export const filterExcept = (idList: string[]) => (element: FlowElement): boolean => !idList.includes(element.id)

export const findParentEdge = (id: string) => (element: FlowElement): boolean => {
    return element.id.includes('-') && element.id.split('-')[1] === id
}
