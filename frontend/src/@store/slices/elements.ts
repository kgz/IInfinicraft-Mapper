import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import type { TElement, TElementMap } from '../../@types/elements'

export const initialState: {
	elements: TElement[]
	element_maps: TElementMap[]
} = {
	elements: [],
	element_maps: [],
}

export const setElements = createAsyncThunk('migrations/setElements', async (elements: TElement[]) => {
	return new Promise<TElement[]>((resolve, reject) => {
		resolve(elements)
	})
})

export const getElements = createAsyncThunk('migrations/getElements', async (_, { rejectWithValue, dispatch }) => {
	return new Promise<TElement[]>((resolve, reject) => {
		// void dispatch(setMigrationsRunning(true))
		axios
			.get<TElement[]>('https://localhost:2021/api/elements')
			.then(response => {
				resolve(response.data)
			})
			.catch(error => {
				// reject(rejectWithValue(error))
			})
			.finally(() => {
				// void dispatch(setMigrationsRunning(false))
			})
	})
})

export const setElementMaps = createAsyncThunk('migrations/setElementMaps', async (element_maps: TElementMap[]) => {
	return new Promise<TElementMap[]>((resolve, reject) => {
		resolve(element_maps)
	})
})

export const getElementMaps = createAsyncThunk(
	'migrations/getElementMaps',
	async (_, { rejectWithValue, dispatch }) => {
		return new Promise<TElementMap[]>((resolve, reject) => {
			// void dispatch(setMigrationsRunning(true))
			axios
				.get<TElementMap[]>('https://localhost:2021/api/element_maps')
				.then(response => {
					resolve(response.data)
				})
				.catch(error => {
					// reject(rejectWithValue(error))
				})
				.finally(() => {
					// void dispatch(setMigrationsRunning(false))
				})
		})
	},
)

const migrationsSlice = createSlice({
	name: 'store',
	initialState,
	extraReducers: builder => {
		builder.addCase(getElements.fulfilled, (state, action) => {
			state.elements = action.payload
		})
		builder.addCase(getElementMaps.fulfilled, (state, action) => {
			state.element_maps = action.payload
		})
	},
	reducers: {},
})

export default migrationsSlice.reducer
