

(() => {
	/**
	 * Fetches elements from the API.
	 * @returns {Promise<{
	 * data: {
	 * 		id: number,
	 * 		name: string,
	 * 		emoji: string,
	 * 		is_new: boolean
	 * }[]}>} A promise that resolves to an array of elements.
	 */
	async function get_elements() {
		return fetch("https://localhost:2021/api/elements").then(res => res.json())
	}


	/**
	 * Fetches element maps from the API.
	 * @returns {Promise<{
	 * id: number,
	 * element_id: number,
	 * second_element_id: number,
	 * result: number,
	 * }[]>} A promise that resolves to an array of element maps.
	 */
	async function get_element_maps() {
		return fetch("https://localhost:2021/api/element_maps").then(res => res.json())
	}


	/**
	 * Fetches the result from the API by sending a request with the provided elements.
	 * @param {string} el1 - The first element.
	 * @param {string} el2 - The second element.
	 * @returns {Promise<{
	 * 		result: string,
	 * 		isNew: boolean,
	 * 		emoji: string
	 * }>} - A promise that resolves to the JSON response from the API.
	 */
	async function getResult(el1, el2) {
		return fetch(`https://neal.fun/api/infinite-craft/pair?first=${el1}&second=${el2}`).then(res => res.json());
	}


	/**
	 * Sends data to the server using a fetch request.
	 * @param {string} el1 - The first element.
	 * @param {string} el2 - The second element.
	 * @param {string} result - The result of the operation.
	 * @param {boolean} isNew - Indicates whether the data is new.
	 * @param {string} emoji - The emoji associated with the data.
	 * @returns {Promise<Object>} - A promise that resolves to the server response as a JSON object.
	 */
	async function sendData(el1, el2, result, isNew, emoji) {
		return fetch(`https://localhost:2021/api/sync?element1=${el1.trim()}&element2=${el2.trim()}&result=${result.trim()}&is_new=${isNew}&emoji=${emoji}`).then(res => res.json());
	}

	function main() {
		get_elements().then(({ data: elements }) => {
			get_element_maps().then(async (element_maps) => {
				console.log({ elements, element_maps });

				// 	/**
				// 	 * @var {el1: string, el2: string, result: number, isNew: boolean, emoji: string}[]
				// 	 */
				// 	let results = [];
				// 	for (let i = 0; i < element_maps.length; i++) {
				// 		results.push({
				// 			el1: elements.find(e => e.id === element_maps[i].element_id).name,
				// 			el2: elements.find(e => e.id === element_maps[i].second_element_id).name,
				// 			result: element_maps[i].result,
				// 			isNew: element_maps[i].is_new,
				// 			emoji: elements.find(e => e.name === element_maps[i].result).emoji
				// 		});
				// 	}
				// 	console.log(results);
				let seen = [];
				for (let i = 0; i < element_maps.length; i++) {
					seen.push(element_maps[i].element_id.toString() + '-' + element_maps[i].second_element_id.toString());
				}

				console.log({ seen })

				let i = 0;
				let j = 0;

				/**
				 * 
				 * @returns {
				 * 		{
				 * 			id: number,
				 * 			name: string,
				 * 			emoji: string,
				 * 			is_new: boolean
				 * 		}[]
				 * }
				 * 
				 */

				const start = Date.now();
				const initial_seen_length = seen.length;
				const timeToHuman = (time) => {
					let seconds = Math.floor(time % 60);
					let minutes = Math.floor(time / 60);
					let hours = Math.floor(minutes / 60);
					minutes = Math.floor(minutes % 60);
					return `${hours}h ${minutes}m ${seconds}s`;
				}

				let current = 0;
				const getNext = () => {
					while (i < elements.length - 1) {
						i++;
						while (j < elements.length - 1) {
							j++;
							const not_seen = elements.filter(e => !seen.includes(e.id.toString() + '-' + elements[j].id.toString()) && !seen.includes(elements[j].id.toString() + '-' + e.id.toString()));
							let tocheck = not_seen.length;
							let total = seen.length + not_seen.length;


							if (!elements[i] || !elements[j] || elements.length === 0) {
								console.error('No more elements to check');
								return null;
							}
							if (
								!seen.includes(elements[i].id.toString() + '-' + elements[j].id.toString())
								&& !seen.includes(elements[j].id.toString() + '-' + elements[i].id.toString())
							) {
								current++;
								let percent = Math.round((current / total) * 10000) / 100;
								const end = Date.now();
								const time = (end - start) / 1000;
								// const estimated = timeToHuman((time / percent) * 100);
								// 70% - 20s
								// total_estimated_time = (20 / 70) * (100 - 70)
								const time_per_check = time / current;
								const time_left = time_per_check * (tocheck);
								const esimated_left = timeToHuman(time_left);
								console.log(`(${current}/${total} ${percent}%) Checking ${elements[i].name} and ${elements[j].name} Estimated time: ${esimated_left} seconds, avg timePerCheck: ${time_per_check} seconds, left: ${tocheck}`);
								// console.log(`(${current}/${tocheck} ${percent}%) Checking ${elements[i].name} and ${elements[j].name} `);
								return [elements[i], elements[j]];
							}
						}
					}

					console.error('No more elements to check');
					return null;

				};

				var sleepSetTimeout_ctrl;

				function sleep(ms) {
					clearInterval(sleepSetTimeout_ctrl);
					return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
				}

				let pair = getNext();
				while (pair != null) {
					console.log(pair);
					pair = getNext();
					if (!pair) {
						break;
					}
					await getResult(pair[0].name, pair[1].name).then((res) => {
						sendData(pair[0].name, pair[1].name, res.result, res.isNew, res.emoji).then((resp) => {
							console.log(resp);
							if (resp) {
								seen.push(pair[0]?.id.toString() + '-' + pair[1]?.id.toString());
								seen.push(pair[1]?.id.toString() + '-' + pair[0]?.id.toString());
								// elements.push(resp);
							} else {
								console.error('Failed to send data to the server');
							}
						});
					}).then(async () => {
						return await sleep(2000 + Math.random() * 5000);

					});


				}

				console.log({ pair });
			});
			// console.log(elements);
		});
	}

	main();
})();