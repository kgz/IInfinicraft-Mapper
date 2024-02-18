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
    xhttp.open("GET", "http://localhost:2021/api/elements", false);
    xhttp.send();


    /**
     * @var {el1: string, el2: string, result: string, isNew: boolean, emoji: string}[]
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
    xhttp.open("GET", "http://localhost:2021/api/element_maps", false);
    xhttp.send();

    console.log(results);
    console.log(elements);

    const findPairs = () => {

        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                setTimeout(() => {
                    /**
                     * @var {
                     *      result: string,
                     *      isNew: boolean,
                     *      emoji: string,
                     *  }
                     */

                    // if we have already seen this pair, skip it
                    if (results.find(r => (r.el1 === elements[i].name && r.el2 === elements[j].name) || (r.el1 === elements[j].name && r.el2 === elements[i].name))) {
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
                            const url = "http://localhost:2021/api/sync?element1=" + elements[i].name + "&element2=" + elements[j].name + "&result=" + pair.result + "&is_new=" + pair.isNew + "&emoji=" + pair.emoji;
                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function () {
                                if (this.readyState == 4 && this.status == 200) {
                                    console.log(this.responseText);
                                }
                            };
                            xhttp.open("GET", url, false);
                            xhttp.send();
                        }
                    };
                    xhttp.open("GET", `https://neal.fun/api/infinite-craft/pair?first=${elements[i].name}&second=${elements[j].name}`, false);
                    xhttp.send();
                }, Math.random() * 10000 * j);
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

