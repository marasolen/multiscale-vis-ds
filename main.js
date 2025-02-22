let corpus;
let originalFilters;
let filters;

const fillTable = (_corpus) => {
    const table = document.getElementById("corpus");
    while (table.rows.length > 7) {
        table.deleteRow(-1);
    }

    document.getElementById("cardinality-cell").innerHTML = `<p>included: ${_corpus.length}</p><p>filtered out: ${corpus.length - _corpus.length}</p>`;

    _corpus.forEach(example => {
        const row = table.insertRow(-1);
        row.classList.add("corpus-row");

        const cells = [];
        Array.from(Array(11)).forEach(_ => {
            cells.push(row.insertCell(-1));
        });

        cells[0].innerHTML = `<a href="${example["url"]}">${example["name"]}</a>`;
        cells[1].innerHTML = `<img class="example-image" src="images/examples/${example["name"].toLowerCase().split(" ").join("")}.png">`;
        cells[2].innerHTML = example["count"].split(":").map(n => isNaN(Number(n)) ? n : Number(n)).join(" : ");
        ["step size type", "encodings", "association"].forEach((column, i) => {
            if (example[column.split(" ").join("")] !== "n/a") {
                cells[3 + i].innerHTML = `<p>${example[column.split(" ").join("")]}</p><img class="icon-image" src="images/icons/scales-${column.split(" ").join("")}-${example[column.split(" ").join("")].split(" ").join("")}.png">`;
            } else {
                cells[3 + i].innerHTML = "n/a";
            }
        });
        ["type", "mode", "visceral time"].forEach((column, i) => {
            if (example[column.split(" ").join("")] !== "n/a") {
                cells[6 + i].innerHTML = `<p>${example[column.split(" ").join("")]}</p><img class="icon-image" src="images/icons/navigation-${column.split(" ").join("")}-${example[column.split(" ").join("")].split("/").join("")}.png">`;
            } else {
                cells[6 + i].innerHTML = "n/a";
            }
        });
        
        cells[9].innerHTML = `<p>${example["concrete"]}</p><img class="icon-image" src="images/icons/familiarity-concrete-${example["concrete"]}.png">`;
        cells[10].innerHTML = `<p>${example["strategy"].toLowerCase()}</p><img class="icon-image" src="images/icons/${example["strategy"].toLowerCase().split(" ").join("")}.png">`
    });
};

const filterCorpus = () => {
    let filteredCorpus = corpus.filter(example => {
        let passedFilter = true;

        Object.keys(filters).forEach(filter => {
            if (filter === "count") {
                const counts = example["count"].split(":").map(n => isNaN(Number(n)) ? 1000000 : Number(n));
                if (filters["count"][0] > counts[0] || filters["count"][1] > counts[1] || filters["count"][2] > counts[2]) {
                    passedFilter = false
                }
            } else {
                if (!filters[filter].includes(example[filter.split(" ").join("")])) {
                    passedFilter = false;
                }
            }
        });

        return passedFilter;
    });

    fillTable(filteredCorpus);
};

Promise.all([d3.csv('data/corpus.csv'), d3.json('data/filters.json')]).then(([_corpus, _filters]) => {
    console.log(_corpus);
    corpus = _corpus;
    corpus.sort((a, b) => {
        if (a["name"] < b["name"]) {
            return -1;
        }
        if (a["name"] > b["name"]) {
            return 1;
        }
        return 0;
    });
    originalFilters = JSON.parse(JSON.stringify(_filters));
    filters = _filters;
    fillTable(corpus);

    const filterItems = document.getElementsByClassName("filter-item-selectable");

    const filterInputs = document.getElementsByClassName("filter-item-number");
    
    for (let i = 0; i < filterItems.length; i++) {
        const filterItem = filterItems[i];
        filterItem.onclick = () => {
            if (filterItem.getAttribute("dimension") === null) {
                filters = JSON.parse(JSON.stringify(originalFilters));
                
                for (let j = 0; j < filterItems.length; j++) {
                    filterItems[j].classList.add("selected");
                }

                for (let j = 0; j < filterInputs.length; j++) {
                    filterInputs[j].childNodes[3].childNodes[3].childNodes[3].value = j === 0 ? 2 : 1;
                }

                filterCorpus();
            } else {
                let dimension = filterItem.getAttribute("dimension");
                
                if (filters[dimension].includes(filterItem.childNodes[1].innerText)) {
                    filters[dimension].splice(filters[dimension].indexOf(filterItem.childNodes[1].innerText), 1);
                    filterItem.classList.remove("selected");
                } else {
                    filters[dimension].push(filterItem.childNodes[1].innerText);
                    filterItem.classList.add("selected");
                }
    
                filterCorpus();
            }
        }
    }
    
    for (let i = 0; i < filterInputs.length; i++) {
        const filterInput = filterInputs[i].childNodes[3].childNodes[3].childNodes[3];
        const inputMap = { "total": 0, "simultaneous": 1, "separate": 2 };

        filterInput.onchange = () => {
            filters["count"][inputMap[filterInput.name]] = Number(filterInput.value);

            filterCorpus();
        };
    }
});