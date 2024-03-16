import { useMemo, useState } from 'react'
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

//Your API response shape will probably be different. Knowing a total row count is important though.
type ApiResp = {
	data: Array<TElement>
	total_row_count: number
}

const Example = () => {
	//manage our own state for stuff we want to pass to the API
	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([])
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})

	//consider storing this code in a custom hook (i.e useFetchUsers)
	const {
		data: { data = [], total_row_count } = {}, //your data and api response will probably be different
		isError,
		isRefetching,
		isLoading,
		refetch,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	} = useQuery<ApiResp>({
		queryKey: [
			'table-data',
			columnFilters, //refetch when columnFilters changes
			globalFilter, //refetch when globalFilter changes
			pagination.pageIndex, //refetch when pagination.pageIndex changes
			pagination.pageSize, //refetch when pagination.pageSize changes
			sorting, //refetch when sorting changes
		],
		queryFn: async () => {
			const fetchURL = new URL(
				'/api/elements',
				process.env.NODE_ENV === 'production' ? 'https://www.material-react-table.com' : 'https://localhost:2021',
			)

			//read our state and pass it to the API as query params
			fetchURL.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`)
			fetchURL.searchParams.set('size', `${pagination.pageSize}`)
			fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []))
			fetchURL.searchParams.set('globalFilter', globalFilter ?? '')
			fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []))

			//use whatever fetch library you want, fetch, axios, etc
			const response = await fetch(fetchURL.href)
			const json = (await response.json()) as ApiResp
			return json
		},
		placeholderData: keepPreviousData, //don't go to 0 rows when refetching or paginating to next page
	})

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
				header: 'is_new',
				accessorKey: 'is_new',
				Header: 'New',
				Cell: ({ row }) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					return <>{row.original.is_new ? 'new' : 'old'}</>
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
		data,

		initialState: { showColumnFilters: true, density: 'compact' },
		manualFiltering: true, //turn off built-in client-side filtering
		manualPagination: true, //turn off built-in client-side pagination
		manualSorting: true, //turn off built-in client-side sorting
		muiToolbarAlertBannerProps: isError
			? {
					color: 'error',
					children: 'Error loading data',
				}
			: undefined,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		renderTopToolbarCustomActions: () => (
			<Tooltip arrow title="Refresh Data">
				{/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */}
				<IconButton onClick={() => refetch()}>
					<RefreshIcon />
				</IconButton>
			</Tooltip>
		),
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
		rowCount: total_row_count,
		state: {
			columnFilters,
			globalFilter,
			isLoading,
			pagination,
			showAlertBanner: isError,
			showProgressBars: isRefetching,
			sorting,
		},
	})

	return <MaterialReactTable table={table} />
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const queryClient = new QueryClient()

const ElementList = () => (
	//App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
	<QueryClientProvider client={queryClient}>
		<Example />
	</QueryClientProvider>
)

export default ElementList
