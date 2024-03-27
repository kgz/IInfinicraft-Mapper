export type TElement = {
	id: number
	emoji: string
	name: string
	is_new: boolean
	map?: string
	created_at: string
}

export type TElementMap = {
	id: number
	element_id: number
	second_element_id: number
	result: number
}
