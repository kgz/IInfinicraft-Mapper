import { $CombinedState, combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import throttle from 'lodash.throttle'

import type { DefaultRootState, TypedUseSelectorHook } from 'react-redux'
import thunk from 'redux-thunk'
import elementSlice from './slices/elements'
import { DBConfig } from './DBConfig'
import { openDB, deleteDB, wrap, unwrap } from 'idb'
const reducer = combineReducers({
	elementSlice,
})

const loadState = async () => {
	const db = await openDB(DBConfig.name, DBConfig.version, {
		upgrade: (db, oldVersion, newVersion, transaction) => {
			console.log('elements', { db, oldVersion, newVersion, transaction })
			if (oldVersion === 0) {
				db.createObjectStore('elements')
			}
		},
	})

	const elements = await db.getAll('elements')
	console.log('loading state', { elements })
	return {
		elementSlice: {
			elements,
		},
	} as DefaultRootState
}

const store = configureStore({
	reducer,
	middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk),
	preloadedState: await loadState(),
})

const saveState = async (state: DefaultRootState) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	const db = await openDB(DBConfig.name, DBConfig.version, {
		upgrade: (db, oldVersion, newVersion, transaction) => {
			console.log('upgrade', { db, oldVersion, newVersion, transaction })
			if (oldVersion === 0) {
				db.createObjectStore('elements')
			}
		},
	})
	const store = db.transaction('elements', 'readwrite').objectStore('elements')
	state.elementSlice.elements.forEach((element, index) => {
		void store.put(element, element.id)
	})
	console.log('saving state', state)
}
// let thr: any = null

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
store.subscribe(() => {
	// // eslint-disable-next-line @typescript-eslint/no-unsafe-call
	// thr && thr.cancel()
	// thr = throttle(() => void saveState(store.getState()), 1000)
	void saveState(store.getState())
	// setstate back to load state
	// store.dispatch({ type: 'RESET' })
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
// store.subscribe(() => saveState(store.getState()))

type StoreType = typeof store

type IAppDispatch = StoreType['dispatch']

export type TRootState = ReturnType<typeof reducer>
declare module 'react-redux' {
	export interface DefaultRootState extends TRootState {}
}
export const useAppDispatch = () => useDispatch<IAppDispatch>()
export const useAppSelector: TypedUseSelectorHook<DefaultRootState> = useSelector
export default store
