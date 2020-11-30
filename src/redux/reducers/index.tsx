import {combineReducers} from 'redux'

import {actionReducers} from './ActionReducers'

export const rootReducer = combineReducers({
    action: actionReducers,
})

export type RootState = ReturnType<typeof rootReducer>
