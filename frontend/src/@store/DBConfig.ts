export const DBConfig = {
	name: 'reduxStore',
	version: 1,
	objectStoresMeta: [
		{
			store: 'elements',
			storeConfig: { keyPath: 'id', autoIncrement: true },
			storeSchema: [
				{ name: 'name', keypath: 'name', options: { unique: false } },
				{ name: 'emoji', keypath: 'emoji', options: { unique: false } },
				{ name: 'is_new', keypath: 'is_new', options: { unique: false } },
				{ name: 'id', keypath: 'id', options: { unique: true } },
			],
		},
		{
			store: 'element_maps',
			storeConfig: { keyPath: 'id', autoIncrement: true },
			storeSchema: [
				{ name: 'element_id', keypath: 'element_id', options: { unique: false } },
				{ name: 'second_element_id', keypath: 'second_element_id', options: { unique: false } },
				{ name: 'result', keypath: 'result', options: { unique: false } },
				{ name: 'id', keypath: 'id', options: { unique: true } },
			],
		},
	],
}
