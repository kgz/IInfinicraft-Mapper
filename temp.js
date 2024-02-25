(() => {
    let elements = [
        { id: 1, name: 'Fire', emoji: '🔥', is_new: false },
        { id: 2, name: 'Water', emoji: '💧', is_new: false },
        { id: 3, name: 'Earth', emoji: '🌍', is_new: false },
        { id: 4, name: 'Wind', emoji: '💨', is_new: false }
    ];

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            elements = JSON.parse(this.responseText);
        }
    };
	xhttp.open("GET", "https://localhost:2021/api/elements", false);
    xhttp.send();


    /**
     * @var {el1: string, el2: string, result: number, isNew: boolean, emoji: string}[]
    */
    let results = [];

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let out = JSON.parse(this.responseText);
            // {
            //     "id": 2,
            //     "element_id": 1,
            //     "second_element_id": 4,
            //     "result": "Lava"
            //     },
            for (let i = 0; i < out.length; i++) {
                results.push({
                    el1: elements.find(e => e.id === out[i].element_id).name,
                    el2: elements.find(e => e.id === out[i].second_element_id).name,
                    result: out[i].result,
                    isNew: out[i].is_new,
                    emoji: elements.find(e => e.name === out[i].result).emoji
                });
            }
        }
    };
	xhttp.open("GET", "https://localhost:2021/api/element_maps", false);
    xhttp.send();

    console.log(results);
    console.log(elements);

    const findPairs = () => {
		let tocheck = elements.length ** 2;
		let done = 0;
        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
				let current = i * elements.length + j;
                setTimeout(() => {
					console.log(`(${current}/${tocheck}) Checking ${elements[i].name} and ${elements[j].name} `);
                    /**
                     * @var {
                     *      result: string,
                     *      isNew: boolean,
                     *      emoji: string,
                     *  }
                     */

                    // if we have already seen this pair, skip it
					if (results.find(r => (r.el1 === elements[i].id && r.el2 === elements[j].id) || (r.el1 === elements[j].id && r.el2 === elements[i].id))) {
						done++;
                        return;
                    }

                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            let pair = JSON.parse(this.responseText);

							results.push({
								el1: elements[i],
								el2: elements[j],
								result: pair.result,
								isNew: pair.isNew,
								emoji: pair.emoji
							});

                            if (pair.isNew) {
                                elements.push({ name: pair.result, emoji: pair.emoji });
                            }
							const url = "https://localhost:2021/api/sync?element1=" + elements[i].name + "&element2=" + elements[j].name + "&result=" + pair.result + "&is_new=" + pair.isNew + "&emoji=" + pair.emoji;
                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    console.log(this.responseText);

									/**
									 * @var {
									 * 	id: number,
									 * 	element_id: number,
									 * 	second_element_id: number,
									 * 	result: number,
									 */
									let resp = JSON.parse(this.responseText);

									results.push(resp);
                                }
								done++;

                            };
                            xhttp.open("GET", url, false);
                            xhttp.send();
                        }

						if (this.readyState == 4 && this.status == 429) {
							// if tomant is rate limiting us, break out of the loop
							console.log('Rate limited, breaking out of loop');
							return results;

						}
                    };
                    xhttp.open("GET", `https://neal.fun/api/infinite-craft/pair?first=${elements[i].name}&second=${elements[j].name}`, false);
                    xhttp.send();
				}, Math.random() * 100000 * j);
            }
        }


		let i = 0;
		let j = 0;
		let current = 0;
		while (1) {
			current++;
			if (results.find(r => (r.el1 === elements[i].name && r.el2 === elements[j].name) || (r.el1 === elements[j].name && r.el2 === elements[i].name))) {

				return;
			}
		}


        return results;
    }
    for (let i = 0; i < 1; i++) {
        console.log(i + ' iteration')
        let r = findPairs();
        console.log(r);
    }
    console.log('done!', { results, elements });
})();

