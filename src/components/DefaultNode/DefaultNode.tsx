import React, { useState } from 'react'
import './DefaultNode.scss'

interface DefaultNodeProps {
    label: string;
    onAddHorizon: () => void;
    onAddVertical: () => void;
}

const DefaultNode: React.FC<DefaultNodeProps> = (props: DefaultNodeProps) => {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="DefaultNode justify-content-center" onClick={(): void => setShowMenu(!showMenu)}>  
            <div className="my-auto">
                <h4>{props.label}</h4>
                <div className="progress">
                  <div className="w-100 progress-bar progress-bar-striped progress-bar-animated" role="progressbar"></div>
                </div>
            </div>
            <div className={["shadow bg-light menu", showMenu ? "": "d-none"].join(' ')}>
                <div className="item">
                    Add Checklist
                </div>
                <div className="item">
                    Add Group
                </div>
                <div className="item">
                    Collapse
                </div>
                <div className="item-danger">
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