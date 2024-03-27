import axios from 'axios'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GraphEdge, GraphNode } from 'reagraph'
import type { ExtNode } from 'relatives-tree/lib/types'
import type { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-2d'
import { Label, Input } from 'semantic-ui-react'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import { forceCollide } from 'd3'
import {
	Alert,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material'
import { useAppSelector } from '../../@store/store'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap'
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

const Search = ({ initial_search = '', result_only = false }: { initial_search?: string; result_only?: boolean }) => {
	const [search, setSearch] = useState(initial_search)
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState<TResp | null>(null)
	const [spacing, setSpacing] = useState(3)
	const { elements } = useAppSelector(state => state.elementSlice)
	const ref = useRef<ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphEdge>> | undefined>()
	const wrapperRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const fg = ref.current

		if (!fg) return

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('collide', forceCollide(120 * spacing))
		// fg.d3Force(
		// 	'collision',
		// 	forceCollide(node => Math.sqrt(100 / (node.level + 10))),
		// )

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('charge')?.strength(250)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
		fg.d3Force('link')?.distance(150)
		// fg.zoomToFit(0)
		fg.zoom(0.2)
		// fg.centerAt((window.innerWidth * 0.8) / 2, window.innerHeight / 2, 0)
		// fg.centerAt(-1000, 1000, 0)
		// // left right node spacing
		// fg.d3Force('x', null)
	}, [ref, results, spacing])

	const handleSearch = useCallback(() => {
		setResults(null)
		setLoading(true)

		const element = elements.find(element => element.name === search)

		if (element && element.map) {
			console.log({ element })
			setResults(JSON.parse(element.map) as TResp)
			setLoading(false)
			return
		}
		void axios
			.get<TResp>(`https://localhost:2021/api/match?element=${search}`)
			.then(response => setResults(response.data))
			.catch(error => console.log('error', error))
			.finally(() => setLoading(false))
	}, [elements, search])

	useEffect(() => {
		if (loading || results) return
		if (initial_search && search) handleSearch()
	}, [handleSearch, initial_search, loading, results, search])

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

	const steps = useMemo(() => {
		if (!results) return
		const out: {
			firstElement: E | undefined
			secondElement: E | undefined
			result: E
		}[] = []
		const el = results

		const addNode = (el: TResp, level: number) => {
			if (!el.parent1 && !el.parent2) return
			out.push({
				firstElement: el.parent1?.element,
				secondElement: el.parent2?.element,
				result: el.element,
			})
			if (el.parent1) addNode(el.parent1, level + 1)
			if (el.parent2) addNode(el.parent2, level + 1)
		}
		addNode(el, 0)

		// order by required create order
		const out2: {
			firstElement: E | undefined
			secondElement: E | undefined
			result: E
			reason: string
		}[] = []

		let index = 0
		let safety = out.length * 3 * 2
		const ogSafety = safety
		let safety2 = 10 ** 100000
		while (out.length > 0) {
			const el = out[index] // { firstElement, secondElement, result}

			// if el is already in out2
			if (out2.find(e => e.result.id === el.result.id)) {
				out.splice(index, 1)
				safety = ogSafety
				index = 0
				continue
			}

			if (safety2-- < 0) {
				console.log('safety2')
				break
			}

			if (safety-- < 0) {
				console.log('safety')
				console.log('cant find', el)
				// out2.push(el)
				// out.splice(index, 1)
				// if its first
				const first = out2.find(e => e.result.id === el.firstElement?.id)
				// if (!first) {
				// 	out2.push({
				// 		firstElement: undefined,
				// 		secondElement: undefined,
				// 		result: el.firstElement as E,
				// 	})
				// }

				// // if its second
				// const second = out2.find(e => e.result.id === el.secondElement?.id)
				// if (!second) {
				// 	out2.push({
				// 		firstElement: undefined,
				// 		secondElement: undefined,
				// 		result: el.secondElement as E,
				// 	})
				// }

				out2.push({
					firstElement: el.firstElement,
					secondElement: el.secondElement,
					result: el.result,
					reason: 'safety',
				})

				// if its result

				out.splice(index, 1)
				safety = ogSafety
				index = 0
				continue
				// index = 0
				// break
			}

			// what do we need to do, check that bothe these elements are in the list

			if (!el) {
				console.log('cant find', el)
				// continue
				break
			}

			if (!el.firstElement && !el.secondElement) {
				out2.push({
					firstElement: undefined,
					secondElement: undefined,
					result: el.result,
					reason: 'base',
				})

				out.splice(index, 1)
				safety = ogSafety
				index = 0
				continue
			}

			// if btoh are base elements then add
			if ((el.firstElement?.id ?? -1) < 5 && (el.secondElement?.id ?? -1) < 5) {
				console.log(`adding ${el.firstElement?.name} and ${el.firstElement?.name} due to base`)
				out2.push({
					firstElement: el.firstElement,
					secondElement: el.secondElement,
					result: el.result,
					reason: 'base',
				})
				out.splice(index, 1)
				safety = ogSafety

				index = 0
				continue
			}

			// else check if they both are in the list
			const first = out2.find(e => e.result.id === el.firstElement?.id)
			const second = out2.find(e => e.result.id === el.secondElement?.id)
			if (
				(first && second) ||
				(first && (el.secondElement?.id ?? -1) < 5) ||
				(second && (el.firstElement?.id ?? -1) < 5)
			) {
				console.log(`found ${first?.result?.name} and ${second?.result?.name}`, first, second)
				out2.push({
					firstElement: el.firstElement,
					secondElement: el.secondElement,
					result: el.result,
					reason: 'found ' + (first?.result?.name ?? '') + ' and ' + (second?.result?.name ?? ''),
				})
				out.splice(index, 1)
				safety = ogSafety

				index = 0
				continue
			} else {
				console.log(`cant find ${el.firstElement?.name} and ${el.secondElement?.name}`, first, second, out2)
			}

			if (index >= out.length - 1) {
				// out2.push(el)
				// out.splice(index, 1)
				// console.log
				index = 0
				continue
			}
			// else move to the next
			index += 1
		}
		// make unique
		// out2 = out2.reduce(
		// 	(acc, current) => {
		// 		const x = acc.find(item => item.result.id === current.result.id)
		// 		if (!x) {
		// 			return acc.concat([current])
		// 		} else {
		// 			return acc
		// 		}
		// 	},
		// 	[] as typeof out2,
		// )
		console.log({ out2 })
		return out2
	}, [results])

	useEffect(() => {
		const t = steps?.map((step, index) => {
			return `${step.firstElement?.emoji ?? ''} ${step.firstElement?.name ?? 'unknown'} + ${
				step.secondElement?.emoji ?? ''
			} ${step.secondElement?.name ?? 'unknown'} = ${step.result.emoji} ${step.result.name}`
		})
		console.log({ t })
	}, [steps])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				// background: 'pink',
			}}
		>
			{!result_only && (
				<div
					style={{
						// width: 200,
						display: 'flex',
						justifyContent: 'center',
						marginTop: 40,
					}}
				>
					<Input
						loading={loading}
						type="search"
						value={search}
						onChange={e => setSearch(e.target.value)}
						onKeyPress={e => e.key === 'Enter' && handleSearch()}
					/>
					<Button onClick={handleSearch}>Search</Button>
					<Input
						loading={loading}
						type="number"
						min="0.01"
						max="10"
						step="0.5"
						value={spacing}
						onChange={e => setSpacing(parseFloat(e.target.value))}
					/>
					<Label>Spacing</Label>
				</div>
			)}

			{loading && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						// marginTop: 40,
						alignContent: 'center',
						alignItems: 'center',
						// height: 500,
						// transitionDuration: '200ms',
						// change direction of transition
						// transform: loading ? 'scale(0)' : 'scale(1)',
						overflow: 'hidden',
						height: 500,
					}}
				>
					<CircularProgress />
				</div>
			)}
			{
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						opacity: loading ? 0 : 1,
						transition: 'opacity 3s',
						height: loading ? 0 : 500,
						// display: loading ? 'none' : 'flex',
					}}
					ref={wrapperRef}
				>
					<div
						style={{
							width: 480,
							height: '100%',
							overflow: 'auto',
							marginRight: 20,
							// scrollSnapType: 'y proximity',
							// snap every 44.5
							scrollSnapType: 'y proximity',
						}}
					>
						<Table sx={{}}>
							<TableBody sx={{}}>
								<TableRow
									sx={{
										position: 'sticky',
										top: 0,
										background: '#1e1e1e',
										zIndex: 100,
									}}
								>
									<TableCell sx={{ p: 0.5 }}>Step</TableCell>
									<TableCell sx={{ p: 0.5 }}>Done?</TableCell>
									<TableCell sx={{ p: 0.5 }}>First Element</TableCell>
									<TableCell width={10} sx={{ p: 0.5 }}>
										+
									</TableCell>
									<TableCell sx={{ p: 0.5 }}>Second Element</TableCell>
									<TableCell width={10} sx={{ p: 0.5 }}>
										=
									</TableCell>
									<TableCell sx={{ p: 0.5 }}>Result</TableCell>
								</TableRow>

								{steps?.map((step, index) => {
									return (
										<TableRow
											key={index}
											sx={{
												scrollSnapAlign: 'start',
												// display: 'table-cell',
												// scrollSnapStop: 'always',
												scrollSnapMarginBottom: '5px',
												scrollMarginBottom: '25px',
											}}
										>
											<TableCell sx={{ p: 0.5 }}>{index}</TableCell>
											<TableCell sx={{ p: 0.5 }}>
												<Checkbox size="small" />
											</TableCell>
											<TableCell sx={{ p: 0.5 }}>
												{step.firstElement?.emoji} {step.firstElement?.name}
											</TableCell>
											<TableCell width={10} sx={{ p: 0.5 }}>
												+
											</TableCell>
											<TableCell
												sx={{ p: 0.5 }}
												style={{
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
												}}
											>
												{step.secondElement?.emoji} {step.secondElement?.name}
											</TableCell>
											<TableCell width={10} sx={{ p: 0.5 }}>
												=
											</TableCell>
											<TableCell sx={{ p: 0.5 }}>
												{step.result.emoji} {step.result.name}
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>

						<Alert
							sx={{
								position: 'sticky',
								bottom: 0,
								// marginTop: 10,
							}}
							severity="warning"
						>
							<>
								* This may not be the most efficient way to get to the result, we do not have enough brain power for
								that.
							</>
						</Alert>
					</div>
					<div
						style={{
							width: window.innerWidth * 0.6,
							height: 500,
							position: 'relative',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: 20,
								right: 20,
								width: 100,
								height: 100,
								// background: 'pink',
								zIndex: 100,
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
							}}
						>
							<Tooltip title="Zoom In">
								<Button
									onClick={() => {
										ref.current?.zoom(ref.current.zoom() * 1.1)
									}}
								>
									<ZoomInIcon />
								</Button>
							</Tooltip>
							<Tooltip title="Increase Spacing">
								<Button
									onClick={() => {
										setSpacing(spacing => spacing + 0.9)
										ref.current?.zoom(ref.current.zoom() * 0.1)
									}}
								>
									<ZoomOutMapIcon />
								</Button>
							</Tooltip>
							<Tooltip title="Zoom Out">
								<Button
									onClick={() => {
										ref.current?.zoom(ref.current.zoom() * 0.9)
									}}
								>
									<ZoomOutIcon />
								</Button>
							</Tooltip>
							<Tooltip title="Decrease Spacing">
								<Button
									onClick={() => {
										setSpacing(spacing => spacing * 0.9)
									}}
								>
									<ZoomInMapIcon />
								</Button>
							</Tooltip>
						</div>
						<ForceGraph3D
							ref={ref}
							graphData={{ nodes: nodes1, links: edges1 }}
							nodeAutoColorBy="label"
							linkAutoColorBy="source"
							linkDirectionalParticles={0}
							linkDirectionalArrowLength={1}
							linkDirectionalArrowRelPos={100}
							nodeRelSize={5}
							backgroundColor="#222"
							// nodeVal={node => node.level as number}
							dagLevelDistance={200 * spacing}
							// dagMode="td"
							// set length of links
							nodeId="id"
							// width={wrapperRef.current?.offsetWidth}
							// height={wrapperRef.current?.offsetHeight}
							width={window.innerWidth * 0.6}
							height={500}
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
								ctx.fillRect(
									node?.x ?? 0 - bckgDimensions[0] / 2,
									node?.y ?? 0 - bckgDimensions[1] / 2,
									...bckgDimensions,
								)

								ctx.textAlign = 'center'
								ctx.textBaseline = 'middle'
								ctx.fillStyle = '#cbcbcb'
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call
								ctx.fillText(label as string, node.x ?? 0, node.y ?? 0)
							}}
						/>
					</div>
				</div>
			}
		</div>
	)
}

export default Search
