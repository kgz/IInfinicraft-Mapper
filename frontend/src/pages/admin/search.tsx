import axios from 'axios'
import type { MutableRefObject } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFamilyTree from 'react-family-tree'
import type { GraphEdge, GraphNode } from 'reagraph'
import { RelType, Gender } from 'relatives-tree/lib/types'
import type { Node, ExtNode } from 'relatives-tree/lib/types'
import type { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-2d'
import {
	TableRow,
	TableHeaderCell,
	TableHeader,
	TableFooter,
	TableCell,
	TableBody,
	MenuItem,
	Icon,
	Label,
	Menu,
	Table,
	Button,
	Input,
	Popup,
} from 'semantic-ui-react'

import { forceCollide } from 'd3'

type E = {
	id: number
	emoji: string
	name: string
}

type TResp = {
	element: E
	parent1: TResp | null
	parent2: TResp | null
}
interface FamilyNodeProps {
	node: ExtNode
	style?: React.CSSProperties
}
export const FamilyNode = memo(function FamilyNode({ node, style }: FamilyNodeProps) {
	return (
		<div style={style}>
			<div>
				<div>{node.id}</div>
			</div>
			{node.hasSubTree && <div />}
		</div>
	)
})

const Search = () => {
	const [search, setSearch] = useState('')
	const [results, setResults] = useState<TResp | null>(null)

	const ref = useRef<ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphEdge>> | undefined>()

	useEffect(() => {
		const fg = ref.current

		if (!fg) return

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('collide', forceCollide(100))
		// fg.d3Force(
		// 	'collision',
		// 	forceCollide(node => Math.sqrt(100 / (node.level + 10))),
		// )

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('charge')?.strength(250)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('link')?.distance(150)

		// left right node spacing
		// fg.d3Force('x', null)
	}, [ref, results])

	const handleSearch = () => {
		void axios
			.get<TResp>(`https://localhost:2021/api/match?element=${search}`)
			.then(response => setResults(response.data))
			.catch(error => console.log('error', error))
	}

	useEffect(() => {
		console.log('search', results)
	}, [results])

	const [nodes1, edges1]: [GraphNode[], GraphEdge[]] = useMemo(() => {
		if (!results) return [[], []]
		const nodes: {
			id: string
			label: string
			data: {
				level: number
			}
			level: number
			links: string[]
		}[] = []
		const edges: GraphEdge[] = []

		const el = results
		let level = 0
		const addNode = (el: TResp) => {
			if (nodes.find(element => element.label === el.element.emoji + ' ' + el.element.name)) return
			if (el.parent1) {
				edges.push({
					id: el.element.id.toString() + '->' + el.parent1.element.id.toString(),
					source: el.element.id.toString(),
					target: el.parent1.element.id.toString(),
				})
			}
			if (el.parent2) {
				edges.push({
					id: el.element.id.toString() + '->' + el.parent2.element.id.toString(),
					source: el.element.id.toString(),
					target: el.parent2.element.id.toString(),
				})
			}

			nodes.push({
				id: el.element.id.toString(),
				label: el.element.emoji + ' ' + el.element.name,
				data: {
					level: level++,
				},
				level,
				links: [
					...(el.parent1 ? [el.parent1.element.id.toString()] : []),
					...(el.parent2 ? [el.parent2.element.id.toString()] : []),
				],
			})

			if (el.parent1) addNode(el.parent1)
			if (el.parent2) addNode(el.parent2)
		}
		addNode(el)

		return [nodes, edges]
	}, [results])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					// width: 200,
					display: 'flex',
					justifyContent: 'center',
					marginTop: 40,
				}}
			>
				<Input type="search" value={search} onChange={e => setSearch(e.target.value)} />
				<Button onClick={handleSearch}>Search</Button>
			</div>
			{results && (
				<ForceGraph3D
					ref={ref}
					graphData={{ nodes: nodes1, links: edges1 }}
					nodeAutoColorBy="label"
					linkAutoColorBy="source"
					linkDirectionalParticles={0}
					linkDirectionalArrowLength={1}
					linkDirectionalArrowRelPos={100}
					nodeRelSize={5}
					// nodeVal={node => node.level as number}
					dagLevelDistance={200}
					// dagMode="td"
					// set length of links
					nodeId="id"
					width={window.innerWidth}
					height={window.innerHeight}
					dagMode="td"
					d3VelocityDecay={0.3}
					// use level distance to set the distance between levels

					nodeCanvasObject={(node, ctx, globalScale) => {
						const label = node.label
						const fontSize = 20 / globalScale
						ctx.font = `${fontSize}px Sans-Serif`
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						const textWidth = ctx.measureText(label as string).width
						const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2) as [number, number]

						ctx.fillStyle = 'rgba(255,255,255, 0)'
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						ctx.fillRect(node?.x ?? 0 - bckgDimensions[0] / 2, node?.y ?? 0 - bckgDimensions[1] / 2, ...bckgDimensions)

						ctx.textAlign = 'center'
						ctx.textBaseline = 'middle'
						ctx.fillStyle = 'black'
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						ctx.fillText(label as string, node.x ?? 0, node.y ?? 0)
					}}
				/>
			)}
		</div>
	)
}

export default Search
