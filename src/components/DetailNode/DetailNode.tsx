import React from 'react'
import {FlowElement} from 'react-flow-renderer'

interface DetailNodeProps {
    node: FlowElement
    onClose: () => void
}

const DetailNode: React.FC<DetailNodeProps> = (props: DetailNodeProps) => {
    return (
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        Detail item
                    </h5>
                    <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                        onClick={props.onClose}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">{props.node.id}</div>
            </div>
        </div>
    )
}

export default DetailNode
