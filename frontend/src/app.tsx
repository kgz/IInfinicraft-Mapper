import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import 'semantic-ui-css/semantic.min.css'
import ElementList from './pages/elementList'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Layout, theme } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useEffect, useState } from 'react'
import Index from './pages'
import Map from './pages/admin/map'
import SearchPage from './pages/admin/search'
// create conetex for types const [isLoggedin, setIsLoggedin] = useState(false);

const DARK = false

const { Header, Sider, Content } = Layout

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
})

const App: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false)
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken()
	const location = useLocation()

	useEffect(() => {
		console.log(location.pathname)
	}, [location])

	const navigate = useNavigate()

	return (
		<ThemeProvider theme={darkTheme}>
			<Layout
				style={{
					height: '100dvh',
					width: '100dvw',
				}}
			>
				<Sider
					trigger={null}
					collapsible
					collapsed={collapsed}
					style={{
						background: '#121212',
						// borderRight: '1px solid white',
					}}
				>
					{/* <div className="demo-logo-vertical" /> */}

					<Search
						style={{
							width: '80%',
							margin: '20px 10%',
						}}
					/>
					{/* <Menu
					theme="dark"
					mode="inline"
					defaultSelectedKeys={['1']}
					items={[
						{
							key: '1',
							icon: <UserOutlined />,
							label: 'nav 1',
							onClick: () => {
								navigate('/')
							},
						},
						// {
						// 	key: '2',
						// 	icon: <VideoCameraOutlined />,
						// 	label: 'nav 2',
						// 	onClick: () => {
						// 		navigate('/map')
						// 	},
						// },
						{
							key: '3',
							icon: <UploadOutlined />,
							label: 'nav 3',
							onClick: () => {
								navigate('/search')
							},
						},
					]}
				/> */}
					<Tabs
						orientation="vertical"
						variant="scrollable"
						value={location.pathname}
						// onChange={handleChange}
						aria-label="Vertical tabs example"
						sx={{ borderRight: 1, borderColor: 'divider' }}
					>
						<Tab label="Home" value="/" onClick={() => navigate('/')} />
						<Tab label="nav 2" value="/map" onClick={() => navigate('/map')} />
						<Tab label="Make Element" value="/search" onClick={() => navigate('/search')} />
						<Tab label="Full List" value="/list" onClick={() => navigate('/list')} />
					</Tabs>
				</Sider>
				<Layout
					style={{
						background: '#222',
						padding: 0,
						margin: 0,
					}}
				>
					{/* <Header style={{ padding: 0, background: colorBgContainer }}>
					<Button
						type="text"
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
						style={{
							fontSize: '16px',
							width: 64,
							height: 64,
						}}
					/>
				</Header> */}
					<Content
						style={{
							// margin: '24px 16px',
							// padding: 24,
							height: '100dvh',
							overflow: 'auto',
							// background: colorBgContainer,
							borderRadius: borderRadiusLG,
							background: 'transparent',
							padding: 0,
							margin: 0,
						}}
					>
						<div>
							<Routes>
								<Route path="/" element={<Index />} />
								<Route path="/list" element={<ElementList />} />
								<Route path="/map" element={<Map />} />
								<Route path="/search" element={<SearchPage />} />
							</Routes>
						</div>
					</Content>
				</Layout>
			</Layout>
		</ThemeProvider>
	)
}

export default App
