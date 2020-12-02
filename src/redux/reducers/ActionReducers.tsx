import {Reducer} from 'redux'

import {ActionDispatchAction} from '../actions/ActionActions'
import ActionTypes from '../actions/ActionTypes'

export interface ActionState {
    action: string
}

const actionState: ActionState = {
    action: '',
}

export const actionReducers: Reducer<ActionState, ActionDispatchAction> = (
    state = actionState,
    action: ActionDispatchAction,
) => {
    switch (action.type) {
        case ActionTypes.SET_ACTION: {
            return {
                ...state,
                action: action.payload.action || state.action,
            }
        }
        default:
            return state
    }
}
