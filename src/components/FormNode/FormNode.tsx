import React, {useState} from 'react'

export interface FormNodeModel {
    title: string
    description: string
}

interface FormNodeProps {
    onSubmit: (value: FormNodeModel) => void
    onClose: () => void
}

const FormNode: React.FC<FormNodeProps> = (props: FormNodeProps) => {
    const [nodeForm, setNodeForm] = useState({
        title: '',
        description: '',
    })

    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>): void => {
        event.preventDefault()
        props.onSubmit(nodeForm)
    }

    return (
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        Add Node
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
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <input
                            required
                            className="form-control mb-3"
                            onChange={(event): void =>
                                setNodeForm({
                                    ...nodeForm,
                                    title: event.target.value,
                                })
                            }
                        />
                        <textarea
                            className="form-control mb-3"
                            onChange={(event): void =>
                                setNodeForm({
                                    ...nodeForm,
                                    description: event.target.value,
                                })
                            }
                        />
                        <input className="btn btn-success" type="submit" value="SUBMIT" />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default FormNode
