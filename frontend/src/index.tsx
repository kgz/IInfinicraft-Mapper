import React from 'react'
import ReactDOM from 'react-dom/client'
import 'semantic-ui-css/semantic.min.css'

import App from './app'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './@store/store'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
	// <React.StrictMode>
	// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css" />
	<BrowserRouter>
		<Provider store={store}>
			<App />
		</Provider>
	</BrowserRouter>,
	// {/* </React.StrictMode>, */}
)
