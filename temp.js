(() => {
    let elements = [
        { name: 'Fire', emoji: '🔥' },
        { name: 'Water', emoji: '💧' },
        { name: 'Earth', emoji: '🌍' },
        { name: 'Wind', emoji: '💨' }
    ];
    /**
     * @var {el1: string, el2: string, result: string, isNew: boolean, emoji: string}[]
    */
    let results = [];
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
                            const url = "http://localhost:2021/api/sync/?element1=" + elements[i].name + "&element2=" + elements[j].name + "&result=" + pair.result + "&is_new=" + pair.isNew + "&emoji=" + pair.emoji;
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
    for (let i = 0; i < 200; i++) {
        console.log(i + ' iteration')
        let r = findPairs();
        console.log(r);
    }
})();

