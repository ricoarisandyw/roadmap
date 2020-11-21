import React from 'react'

interface DefaultNodeProps {
    label: string;
    onAddHorizon: () => void;
    onAddVertical: () => void;
}

const DefaultNode: React.FC<DefaultNodeProps> = (props: DefaultNodeProps) => {
    return (
        <>  
            <h4>{props.label}</h4>
            <button className="btn btn-primary" onClick={props.onAddHorizon}>Add horizon</button>
            <button className="btn btn-success" onClick={props.onAddVertical}>Add vertical</button>
        </>
    )
}

export default DefaultNode