import React, {useState} from 'react'
import {useDispatch} from 'react-redux'

import Icons from '../Icons/Icons'
import {updateAction} from '../../redux/actions/ActionActions'

import ThreeDot from './ThreeDot'
import ActionType from './ActionType'

import './DefaultNode.scss'

interface DefaultNodeProps {
    title: string
    type: 'GROUP' | 'CHECK' | 'OTHERS'
    checked?: boolean
    progress?: number
}

const DefaultNode: React.FC<DefaultNodeProps> = (props: DefaultNodeProps) => {
    const [showMenu, setShowMenu] = useState(false)
    const dispatch = useDispatch()

    const onMenuSelected = (selectedAction: string): void => {
        setShowMenu(false)
        dispatch(updateAction(selectedAction))
    }

    const renderCheck = (): JSX.Element => {
        if (props.checked)
            return <Icons.Check className="my-auto" onClick={(): void => onMenuSelected(ActionType.CHECK)} />
        else return <Icons.Uncheck className="my-auto" onClick={(): void => onMenuSelected(ActionType.CHECK)} />
    }

    return (
        <div className="DefaultNode justify-content-center">
            <div className="w-100 my-auto">
                <div className={['label d-flex', props.type === 'CHECK' ? 'justify-content-center' : ''].join(' ')}>
                    <div className={['flex-grow-1', props.type === 'CHECK' ? 'text-left' : 'text-center'].join(' ')}>
                        {props.title}
                    </div>
                    {props.type === 'CHECK' ? (
                        <input
                            checked={props.checked}
                            onChange={(): void => onMenuSelected(ActionType.CHECK)}
                            className="check form-control"
                            type="checkbox"
                        />
                    ) : null}
                    {props.type === 'OTHERS' ? renderCheck() : null}
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
                    Expand/Collapse
                </div>
                <div className="item" onClick={(): void => onMenuSelected(ActionType.MOVE_RIGHT)}>
                    Move to Right
                </div>
                <div className="item" onClick={(): void => onMenuSelected(ActionType.MOVE_LEFT)}>
                    Move to Left
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
