import React from 'react'
import './App.scss'
import { hot } from 'react-hot-loader/root'

function App() {
    return (
        <div className="container">
            Hello World
            <span className="btn btn-success">SUCCESS</span>
        </div>
    )
}

export default hot(App)
