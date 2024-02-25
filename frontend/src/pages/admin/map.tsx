/* eslint-disable @typescript-eslint/no-unsafe-return */
import { useDispatch } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../@store/store'
import { useEffect, useMemo, useRef } from 'react'
import { getElementMaps, getElements } from '../../@store/slices/elements'
import Graph from 'react-graph-vis'
import type { GraphEdge, GraphNode } from 'reagraph'
import { GraphCanvas } from 'reagraph'
import ThreeForceGraph from 'three-forcegraph'
import ForceGraph3D from 'react-force-graph-2d'

const Map = () => {
	const dispatch = useAppDispatch()
	const { element_maps, elements } = useAppSelector(state => state.elementSlice)
	const ref = useRef(null)

	useEffect(() => {
		void dispatch(getElements())
		void dispatch(getElementMaps())
	}, [dispatch])

	const nodes1 = useMemo(() => {
		return elements.map(element => {
			const t = {
				id: element.id.toString(),
				name: element.emoji + ' ' + element.name,
				links: [],
			}
			return t
		})
	}, [elements])

	const edges1 = useMemo(() => {
		return element_maps
			.map(element_map => {
				const result = elements.find(element => element.id === element_map.result)
				if (!result) return
				return {
					id: element_map.id.toString() + '->' + result?.id.toString(),
					source: element_map.element_id.toString(),
					target: result?.id.toString(),
					name: result?.emoji + ' ' + element_map.result,
				}
			})
			.filter(Boolean) as GraphEdge[]
	}, [element_maps, elements])

	const nodes = [
		{ id: '1', label: 'Node 1' },
		{ id: '2', label: 'Node 2' },
		{ id: '3', label: 'Node 3' },
		{ id: '4', label: 'Node 4' },
		{ id: '5', label: 'Node 5' },
	]

	const edges = [
		{ id: '1->2', source: '1', target: '2' },
		{ id: '1->3', source: '1', target: '3' },
		{ id: '2->4', source: '2', target: '4' },
		{ id: '2->5', source: '2', target: '5' },
	]

	return (
		// <GraphCanvas
		// 	nodes={nodes1}
		// 	edges={edges1}
		// 	edgeArrowPosition="end"
		// 	labelType="all"
		// 	edgeLabelPosition="above"
		// 	// renderNode={({ size, color, opacity, node }) => <>'asdfasfasd'</>}
		// 	// theme={{
		// 	// 	node: {
		// 	// 		fill: 'black',
		// 	// 		activeFill: 'red',
		// 	// 		opacity: 1,
		// 	// 		selectedOpacity: 1,
		// 	// 		inactiveOpacity: 1,
		// 	// 		label: {
		// 	// 			color: 'black',
		// 	// 			stroke: 'black',
		// 	// 			activeColor: 'black',
		// 	// 		},
		// 	// 	},
		// 	// 	edge: {
		// 	// 		fill: 'black',
		// 	// 		activeFill: 'black',
		// 	// 		opacity: 1,
		// 	// 		selectedOpacity: 1,
		// 	// 		inactiveOpacity: 1,
		// 	// 		label: {
		// 	// 			color: 'green',
		// 	// 			stroke: 'green',
		// 	// 			activeColor: 'green',
		// 	// 			fontSize: 15,
		// 	// 		},
		// 	// 	},
		// 	// 	ring: {
		// 	// 		fill: 'black',
		// 	// 		activeFill: 'black',
		// 	// 	},
		// 	// 	arrow: {
		// 	// 		fill: 'black',
		// 	// 		activeFill: 'black',
		// 	// 	},

		// 	// 	lasso: {
		// 	// 		background: 'black',
		// 	// 		border: 'black',
		// 	// 	},
		// 	// }}
		// />

		<ForceGraph3D
			graphData={{ nodes: nodes1, links: edges1 }}
			nodeAutoColorBy="label"
			linkAutoColorBy="source"
			linkDirectionalParticles={0}
			linkDirectionalArrowLength={1}
			linkDirectionalArrowRelPos={200000}
			nodeRelSize={5}
			// dagMode="td"
			// set length of links
			width={window.innerWidth * 2}
			height={window.innerHeight * 2}
			backgroundColor="pink"
			// nodeVal={node => {
			// 	return 5
			// }}
			nodeCanvasObject={(node, ctx, globalScale) => {
				const label = node.name
				const fontSize = 20 / globalScale
				ctx.font = `${fontSize}px Sans-Serif`
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const textWidth = ctx.measureText(label).width
				const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2) as [number, number]

				ctx.fillStyle = 'rgba(255,255,255, 0)'
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				ctx.fillRect(node?.x ?? 0 - bckgDimensions[0] / 2, node?.y ?? 0 - bckgDimensions[1] / 2, ...bckgDimensions)

				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.fillStyle = 'black'
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				ctx.fillText(label, node.x ?? 0, node.y ?? 0)
			}}
		/>
	)
}

export default Map
