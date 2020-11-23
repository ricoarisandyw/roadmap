import React, {useState} from 'react'

import ThreeDot from './ThreeDot'
import ActionType from './ActionType'
import './DefaultNode.scss'

interface DefaultNodeProps {
    label: string
    type: 'GROUP' | 'CHECK'
    checked?: boolean
    progress?: number
    onAction: (action: string) => void
}

const DefaultNode: React.FC<DefaultNodeProps> = (props: DefaultNodeProps) => {
    const [showMenu, setShowMenu] = useState(false)

    const onMenuSelected = (action: string): void => {
        setShowMenu(false)
        props.onAction(action)
    }

    return (
        <div className="DefaultNode justify-content-center">
            <div className="w-100 my-auto">
                <div className={['label d-flex', props.type === 'CHECK' ? 'justify-content-center' : ''].join(' ')}>
                    <div className={['flex-grow-1', props.type === 'CHECK' ? 'text-left' : 'text-center'].join(' ')}>
                        {props.progress}
                    </div>
                    {props.type === 'CHECK' ? (
                        <input
                            checked={props.checked}
                            onChange={(): void => props.onAction(ActionType.CHECK)}
                            className="check form-control"
                            type="checkbox"
                        />
                    ) : null}
                </div>
                {props.type === 'GROUP' ? (
                    <div className="progress">
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{width: `${props.progress}%`}}
                        ></div>
                    </div>
                ) : null}
            </div>
            <div className="menu-button" onClick={(): void => setShowMenu(!showMenu)}>
                <ThreeDot />
            </div>
            <div className={['shadow bg-light menu', showMenu ? '' : 'd-none'].join(' ')}>
                <div className="item" onClick={(): void => onMenuSelected(ActionType.DETAIL)}>
                    Detail
                </div>
                <div className="item" onClick={(): void => onMenuSelected(ActionType.ADD_CHECKLIST)}>
                    Add Checklist
                </div>
                <div className="item" onClick={(): void => onMenuSelected(ActionType.COLLAPSE)}>
                    Collapse
                </div>
                <div className="item-danger" onClick={(): void => onMenuSelected(ActionType.DELETE)}>
                    Delete
                </div>
                <div className="item" onClick={(): void => setShowMenu(false)}>
                    Close Menu
                </div>
            </div>
        </div>
    )
}

export default DefaultNode
