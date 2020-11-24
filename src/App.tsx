import React from 'react'
import './App.scss'
import {hot} from 'react-hot-loader/root'

import Route from './pages/routes'

function App() {
    return (
        <div className="container-fluid">
            <Route />
        </div>
    )
}

export default hot(App)
