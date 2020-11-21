import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import App from '../App'

test('renders Hello World', () => {
    const { getByText } = render(<App />)
    const textElement = getByText('Hello World')
    expect(textElement).toBeInTheDocument()
})
