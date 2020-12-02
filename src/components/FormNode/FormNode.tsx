import React, {useState} from 'react'
import moment from 'moment'
import {useDispatch, useSelector} from 'react-redux'

import {updateAction} from '../../redux/actions/ActionActions'
import {RootState} from '../../redux/reducers'
import {ActionState} from '../../redux/reducers/ActionReducers'
import ActionType from '../DefaultNode/ActionType'

export interface FormNodeModel {
    title: string
    description: string
    dueDate?: string
}

interface FormNodeProps {
    onSubmit: (value: FormNodeModel) => void
}

const FormNode: React.FC<FormNodeProps> = (props: FormNodeProps) => {
    const dispatch = useDispatch()

    const {action} = useSelector<RootState, ActionState>((state) => state.action)

    const [nodeForm, setNodeForm] = useState<FormNodeModel>({
        title: '',
        description: '',
    })

    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>): void => {
        event.preventDefault()
        props.onSubmit(nodeForm)
    }

    const onClose = (): void => {
        dispatch(updateAction('STAND_BY'))
    }

    return (
        <div
            className={[
                'modal-dialog',
                action === ActionType.ADD_CHECKLIST || action === ActionType.DETAIL ? '' : 'd-none',
            ].join(' ')}
            role="document"
        >
            {action}
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                        Add Node
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
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
                        <input
                            type="date"
                            className="form-control"
                            value={moment(nodeForm.dueDate).format('yyyy-MM-DD') || ''}
                            onChange={(event): void => {
                                setNodeForm({
                                    ...nodeForm,
                                    dueDate: event.target.value,
                                })
                            }}
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
