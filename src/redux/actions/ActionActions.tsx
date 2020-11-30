import {Action} from 'redux'

import {ActionState} from '../reducers/ActionReducers'

import ActionTypes from './ActionTypes'

export interface ActionDispatchAction extends Action<string> {
    payload: Partial<ActionState>
}

export const updateAction = (action: string): ActionDispatchAction => ({
    type: ActionTypes.SET_ACTION,
    payload: {action},
})
