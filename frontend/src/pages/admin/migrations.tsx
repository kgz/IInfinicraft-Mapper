import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../@store/store'
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
import { getElementMaps, getElements } from '../../@store/slices/elements'
import type { TElement } from '../../@types/elements'

export const Migrations = () => {
	const { element_maps, elements } = useAppSelector(state => state.elementSlice)
	const dispatch = useAppDispatch()
	useEffect(() => {
		void dispatch(getElements())
		void dispatch(getElementMaps())
	}, [dispatch])

	type E = {
		id: number
		children: E[]
	}

	const getSourceElement = useCallback(
		(element_id: number, stack = 0): E => {
			if (stack > 10) {
				return {
					id: element_id,
					children: [],
				}
			}
			const element = elements.find(element => element.id === element_id)
			if (!element) {
				return {
					id: element_id,
					children: [],
				}
			}
			// console.log('element', element)

			// get the 2 element_maps that make this element
			const em = element_maps
				.filter(
					element_map =>
						element_map.result === element.id &&
						element_map.element_id !== element.id &&
						element_map.second_element_id !== element.id,
				)
				.sort((a, b) => a.element_id + a.second_element_id - (b.element_id + b.second_element_id))[0]

			if (!em?.element_id || !em?.second_element_id) {
				return {
					id: element_id,
					children: [],
				}
			}

			const children: E[] = []
			if (em.element_id > 3) {
				children.push(getSourceElement(em.element_id, stack + 1))
			}
			if (em.second_element_id > 3) {
				children.push(getSourceElement(em.second_element_id, stack + 1))
			}
			return {
				id: element_id,
				children: children,
			}
		},
		[elements, element_maps],
	)

	// const elements_with_paths = useEffect(() => {
	// 	const r = elements.slice(6, 7).map(element => {
	// 		const paths = getSourceElement(element.id)
	// 		console.log(paths)
	// 		return {
	// 			...element,
	// 			children: paths.children,
	// 		}
	// 	})

	// 	const myRecursiveFunction = (e: E) => {
	// 		// flatten E to be id_1 + id2 -> id3 + id4
	// 		if (e.children.length === 0) {
	// 			return e.id
	// 		}
	// 		return e.children.map(myRecursiveFunction).join(' + ')
	// 	}

	// 	const s = r.map(element => {
	// 		const paths = myRecursiveFunction(element)
	// 		return {
	// 			...element,
	// 			paths,
	// 		}
	// 	})

	// 	console.log(s)
	// 	// print out a path structure
	// 	// console.log(r[0].paths.)
	// }, [elements, getSourceElement])

	const getElementPath = (element_name: string | undefined) => {
		if (!element_name) {
			return
		}

		let safety = 500
		const path: [TElement, TElement][] = []
		const element = elements.find(element => element.name === element_name)

		if (!element) {
			console.error('element not found')
			return
		}

		// reverse binary search to find the element that makes the element
		const findElement = (element_id: number) => {
			if (safety-- < 0) {
				console.error('safety')
				return
			}
			const em = element_maps.filter(
				element_map => element_map.result === element_id && element_map.element_id < element.id,
			)

			// sort em by lowest id
			em.sort((a, b) => b.element_id + b.second_element_id - (a.element_id + a.second_element_id))
			const fuirst = em[0]
			if (!fuirst) {
				console.error('em not found')
				return
			}
			const element1 = elements.find(element => element.id === fuirst.element_id)
			const element2 = elements.find(element => element.id === fuirst.second_element_id)
			console.log(element1, element2)
			if (!element1 || !element2) {
				return
			}
			path.push([element1, element2])
			if (element1.id > 3) {
				findElement(element1.id)
			}
			if (element2.id > 3) {
				findElement(element2.id)
			}
		}
		findElement(element.id)

		console.log({ path })
	}

	return (
		<>
			<Button
				onClick={() => {
					void dispatch(getElements())
					void dispatch(getElementMaps())
				}}
			>
				Refresh
			</Button>

			<Table celled>
				<TableHeader>
					<TableRow>
						<TableHeaderCell>ID</TableHeaderCell>
						<TableHeaderCell>Element1</TableHeaderCell>
						<TableHeaderCell>Element2</TableHeaderCell>
						<TableHeaderCell>Result</TableHeaderCell>
						<TableHeaderCell>New</TableHeaderCell>
					</TableRow>
				</TableHeader>
				<TableBody>
					{elements &&
						[...element_maps].map((element_map, index) => {
							const element1 = elements.find(element => element.id === element_map.element_id)
							const element2 = elements.find(element => element.id === element_map.second_element_id)
							const result = elements.find(element => element.id === element_map.result)

							if (!element1 || !element2) {
								console.warn('element1 or element2 not found', { element_map })
								return null
							}
							return (
								<TableRow key={index}>
									<TableCell>{element_map.id}</TableCell>
									<TableCell>{element1.name + ' ' + element1.emoji}</TableCell>
									<TableCell>{element2.name + ' ' + element2.emoji}</TableCell>
									<TableCell onClick={() => getElementPath(result?.name)}>
										{result?.name + ' ' + result?.emoji}
									</TableCell>
									<TableCell>{result?.is_new ? <Label color="green">New</Label> : null}</TableCell>
								</TableRow>
							)
						})}
				</TableBody>
				{/* <TableFooter>
					<TableRow>
						<TableHeaderCell colSpan="4">
							<Menu floated="right" pagination>
								<MenuItem as="a" icon>
									<Icon name="chevron left" />
								</MenuItem>
								<MenuItem as="a">1</MenuItem>
								<MenuItem as="a">2</MenuItem>
								<MenuItem as="a">3</MenuItem>
								<MenuItem as="a">4</MenuItem>
								<MenuItem as="a" icon>
									<Icon name="chevron right" />
								</MenuItem>
							</Menu>
						</TableHeaderCell>
					</TableRow>
				</TableFooter> */}
			</Table>
		</>
	)
}

export default Migrations
