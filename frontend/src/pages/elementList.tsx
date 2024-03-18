import { useEffect, useMemo, useState } from 'react'
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFiltersState,
	type MRT_PaginationState,
	type MRT_SortingState,
} from 'material-react-table'
import { Button, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { QueryClient, QueryClientProvider, keepPreviousData, useQuery } from '@tanstack/react-query' //note: this is TanStack React Query V5
import type { TElement } from '../@types/elements'
import Search from './admin/search'
import { getElements } from '../@store/slices/elements'
import { useAppDispatch, useAppSelector } from '../@store/store'

//Your API response shape will probably be different. Knowing a total row count is important though.
type ApiResp = {
	data: Array<TElement>
	total_row_count: number
}

const Example = () => {
	const dispatch = useAppDispatch()
	const { elements } = useAppSelector(state => state.elementSlice)
	// useEffect(() => {
	// 	void dispatch(getElements())
	// }, [dispatch])

	const columns = useMemo<MRT_ColumnDef<TElement>[]>(() => {
		return [
			// {
			// 	Header: 'ID',
			// 	// accessor: 'id',
			// 	accessorKey: 'id',
			// 	header: 'id',
			// 	// id: 'id', //needed for column filters
			// 	//...other column options
			// },
			{
				Header: 'Name',
				accessorKey: 'name',
				header: 'name',
				//...other column options
			},
			{
				Header: 'Emoji',
				accessorKey: 'emoji',
				header: 'emoji',
			},
			{
				Header: 'New?',
				accessorKey: 'is_new',
				header: 'is_new',
				Cell: ({ row }) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					const element = row.original
					return (
						row.original.is_new && (
							<Button variant="text" color={row.original.is_new ? 'success' : 'primary'}>
								{row.original.is_new ? 'New!' : ''}
							</Button>
						)
					)
				},
			},
			{
				Header: 'Element Map',
				header: 'id',
				accessorKey: 'id',
				Cell: ({ row }) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					const element = row.original
					return <Button onClick={() => row.toggleExpanded()}>{row.getIsExpanded() ? 'hide' : 'view'} map</Button>
				},
			},

			//...other columns
		]
	}, [])
	//column definitions...

	const table = useMaterialReactTable({
		columns,
		data: elements,

		initialState: { showColumnFilters: true, density: 'compact' },
		muiPaginationProps: {
			rowsPerPageOptions: [5, 10, 20, 50, 100, elements.length],
		},
		renderDetailPanel: ({ row }) => {
			const element = row.original
			return (
				<div
					key={element.id}
					style={{
						width: '100%',
						// border: 'dashed 1px red',
					}}
				>
					<Search initial_search={element.name} result_only />
				</div>
			)
		},
		// enableRowVirtualization: true,
		// actionButtons: [
		// 	{
		// 		tooltip: 'Refresh',
		// 		icon: RefreshIcon,
		// 		onClick: () => {
		// 			void dispatch(getElements())
		// 		},
		// 	},
		// ],
	})

	return <MaterialReactTable table={table} />
}

const ElementList = () => (
	//App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
	// <QueryClientProvider client={queryClient}>
	<Example />
	// </QueryClientProvider>
)

export default ElementList
