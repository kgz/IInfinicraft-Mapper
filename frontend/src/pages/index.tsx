import React, { useEffect, useMemo } from 'react'
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

	const wakiest = useMemo(() => {
		if (!elements) return []
		const _element = JSON.parse(JSON.stringify(elements)) as typeof elements
		// get top 5 longets maps
		const wakiest = _element.sort((a, b) => (b.map?.length || 0) - (a.map?.length || 0)).slice(0, 5)
		console.log({ wakiest })
		return wakiest
	}, [elements])

	return <div className="App"></div>
}

export default Index
