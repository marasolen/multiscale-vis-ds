let corpus;
let filters;

const fillTable = (corpus) => {
    const table = document.getElementById("corpus");
    while (table.rows.length > 7) {
        table.deleteRow(-1);
    }

    corpus.forEach(example => {
        const row = table.insertRow(-1);
        row.classList.add("corpus-row");

        const cells = [];
        Array.from(Array(11)).forEach(_ => {
            cells.push(row.insertCell(-1));
        });

        cells[0].innerHTML = example["name"];
        cells[2].innerHTML = example["count"].split(":").map(n => isNaN(Number(n)) ? n : Number(n)).join(" : ");
        ["step size type", "encodings", "association"].forEach((column, i) => {
            if (example[column.split(" ").join("")].length > 0) {
                cells[3 + i].innerHTML = `<p>${example[column]}</p><img src="images/icons/scales-${column.split(" ").join("")}-${example[column.split(" ").join("")].split(" ").join("")}.png">`
            }
        });
        ["type", "mode", "visceral time"].forEach((column, i) => {
            if (example[column.split(" ").join("")].length > 0) {
                cells[6 + i].innerHTML = `<p>${example[column]}</p><img src="images/icons/navigation-${column.split(" ").join("")}-${example[column.split(" ").join("")].split("/").join("")}.png">`
            }
        });
        
        cells[9].innerHTML = `<p>${example["concrete"]}</p><img src="images/icons/familiarity-concrete-${example["concrete"]}.png">`
        cells[10].innerHTML = example["strategy"].toLowerCase();
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
            } else if (example[filter.split(" ").join("")] !== "") {
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
    filters = _filters;
    fillTable(corpus);

    const filterItems = document.getElementsByClassName("filter-item-selectable");
    
    for (let i = 0; i < filterItems.length; i++) {
        const filterItem = filterItems[i];
        filterItem.onclick = () => {
            let dimension = "strategy";
            if (filterItem.childNodes.length > 3) {
                dimension = filterItem.childNodes[3].src.split("-")[1];
            }
            
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

    const filterInputs = document.getElementsByClassName("filter-item-number");
    
    for (let i = 0; i < filterInputs.length; i++) {
        const filterInput = filterInputs[i].childNodes[3].childNodes[3].childNodes[3];
        const inputMap = { "total": 0, "simultaneous": 1, "separate": 2 };

        filterInput.onchange = () => {
            filters["count"][inputMap[filterInput.name]] = Number(filterInput.value);

            filterCorpus();
        };
    }
});