import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Provider } from 'react-redux'
import store from './@store/store'
import { Helmet } from 'react-helmet'
import Migrations from './pages/admin/migrations'
import 'semantic-ui-css/semantic.min.css'
import Login from './pages/login'
import styles from './@scss/template.module.scss'
import theme from './@scss/_root.module.scss'
import Map from './pages/admin/map'
import Search from './pages/admin/search'
// create conetex for types const [isLoggedin, setIsLoggedin] = useState(false);

const DARK = false

const App = () => {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<div className={styles.container + ' ' + (DARK ? theme.dark : '')}>
					<Routes>
						<Route path="/" element={<Migrations />} />
						<Route path="/map" element={<Map />} />
						<Route path="/search" element={<Search />} />
					</Routes>
				</div>
			</BrowserRouter>
		</Provider>
	)
}

export default App
