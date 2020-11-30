import NodeModel from '../../model/NodeModel'

export const NodeSeed: NodeModel[] = [
    {
        id: '1',
        roadmapId: 1,
        progress: 100,
        description: 'this is description',
        title: 'React.js',
        dueDate: new Date('2021-01-01'),
        parent: '',
    },
    {
        id: '2',
        roadmapId: 1,
        progress: 100,
        description: 'this is description',
        title: 'HTML',
        dueDate: new Date('2021-01-01'),
        parent: '4',
    },
    {
        id: '3',
        roadmapId: 1,
        progress: 0,
        description: 'this is description',
        title: 'CSS',
        dueDate: new Date('2021-01-01'),
        parent: '4',
    },
    {
        id: '4',
        roadmapId: 1,
        progress: 0,
        description: 'this is description',
        title: 'Web Basic',
        dueDate: new Date('2021-01-01'),
        parent: '1',
    },
    {
        id: '5',
        roadmapId: 1,
        progress: 100,
        description: 'this is description',
        title: 'JSX',
        dueDate: new Date('2021-01-01'),
        parent: '1',
    },
]
