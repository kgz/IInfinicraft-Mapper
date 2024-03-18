import React, { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../@store/store'
import { dispatch } from 'd3'
import { getElements } from '../@store/slices/elements'

function Index() {
	const dispatch = useAppDispatch()
	const { elements } = useAppSelector(state => state.elementSlice)

	useEffect(() => {
		void dispatch(getElements())
	}, [dispatch])

	useEffect(() => {
		console.log({ elements })
	}, [elements])

	return <div className="App"></div>
}

export default Index
