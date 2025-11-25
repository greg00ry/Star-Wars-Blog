
const Sidebar = {
    el: null,
    menuButton: null,

    init() {
        this.el = document.getElementById("sidebar")
        this.menuButton = document.getElementById("menu-button")

        //otwieranie / zamykanie sidebaru
        this.menuButton.addEventListener("click", () => {
            this.el.classList.toggle("open")
        })

        //zamykanie sidebaru klikajac w tlo body
        document.body.addEventListener("click", (e) => {
            if (!this.el.contains(e.target) && e.target !== this.menuButton) {
                this.el.classList.remove("open")
            }
        })

        //klikniecia w linki kategorii
        this.el.querySelectorAll("a[data-type]").forEach(link => {
            const type = link.dataset.type
            const submenu = document.getElementById(`submenu-${type}`)

            link.addEventListener("click", (e) => {
                e.preventDefault()
                this.toggleSubmenu(type, submenu)
            })
        })

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.el.classList.remove("open")
            }
        })
    },

    async toggleSubmenu(type, submenu) {
        //jesli juz otwarte -> zamknij
        if(submenu.dataset.open === "true") {
            submenu.innerHTML = ""
            submenu.dataset.open = "false"
            return
        }

        //zapisz stan w data- atrybutach
        submenu.dataset.open = "true"
        let loadedItems = []
        submenu.dataset.type = type
        submenu.dataset.type = "1"

       //pokaz stan "Loading.."
       submenu.innerHTML = ""
       const status = document.createElement("div")
       status.className = "submenu-status"
       status.textContent = "Loading..."
       submenu.appendChild(status)

       // SEARCH INPUT
       const search = document.createElement("input")
       search.type = "text"
       search.className = "submenu-search"
       search.placeholder = "Filter..."
       // na razie jeszcze nie dodajemy do DOM - po zaladowaniu
       let ul = document.createElement("ul")

       // KONTAINER "Load more"
        const moreWrapper = document.createElement("div")
        moreWrapper.className = "submenu-more"
        const moreBtn = document.createElement("button")
        moreBtn.textContent = "Load more"
        moreWrapper.appendChild(moreBtn)

        const loadPage = async (page) => {
            try {
                status.textContent = "Loading..."
                status.style.display = "block"
                moreBtn.disabled = true

                const {items, next} = await API.getList(type, page)

                //przy pierwszym ładowaniu podmieniamy  zawartosc submenu
                if (!submenu.contains(search)) {
                    submenu.innerHTML = ""
                    submenu.appendChild(search)
                    submenu.appendChild(ul)
                    submenu.appendChild(status)
                    submenu.appendChild(moreWrapper)
                }
                items.forEach(item => {
                    loadedItems.push(item)
                    const li = document.createElement("li")
                    li.textContent = item.name || item.title
                    li.addEventListener("click", async (e) => {
                        e.stopPropagation()
                        Modal.show("<p>Loading...</p>")
                        try {
                            const details = await API.getByUrl(item.url)
                            this.openDetails(details, type)
                        } catch (err) {
                            Modal.show("<p>Failed to load details. Try again.</p>")
                        }
                    })
                    ul.appendChild(li)
                })

                //update stanu
                submenu.dataset.page = String(page)

                // zarzadzanie load more
                if (!next) {
                    status.textContent = "No more results."
                    moreBtn.disabled = true
                } else {
                    status.textContent = ""
                    moreBtn.disabled = false
                    moreBtn.onclick = (e) => {
                        e.stopPropagation()
                        const nextPage = page + 1
                        loadPage(nextPage)
                    }
                }
            } catch (err) {
                console.error(err)
                submenu.innerHTML = ""
                const error = document.createElement("div")
                error.className = "submenu-status error"
                error.textContent = "Failed to load data. Try again"
                submenu.appendChild(error)
            }
        }

        //filtrowanie - dziala na wszystkich zaladowanych <li>
        
        function debounce(fn, delay = 200) {
            let timeout
            return (...args) => {
                clearTimeout(timeout)
                timeout = setTimeout(() => fn.apply(null, args), delay);
            }
        }

        function objectContainsTerm(obj, term) {
            const t = term.toLowerCase();

            // przechodzimy po WSZYSTKICH polach obiektu
            return Object.values(obj).some(value => {
                if (!value) return false;

                // jeśli wartość jest tablicą → sprawdź w niej również
                if (Array.isArray(value)) {
                return value.some(v => String(v).toLowerCase().includes(t));
                }

                return String(value).toLowerCase().includes(t);
            });
        }



        

        loadPage(1)
        
        const applyFilter = () => {
            const term = search.value.toLowerCase();

            // czyścimy listę
            ul.innerHTML = "";

            // filtrujemy WSZYSTKIE załadowane obiekty
            const filtered = loadedItems.filter(obj => objectContainsTerm(obj, term));

            // renderujemy wynik
            filtered.forEach(obj => {
                const li = document.createElement("li");
                li.textContent = obj.name || obj.title;
                li.addEventListener("click", async (e) => {
                e.stopPropagation();
                Modal.show("<p>Loading...</p>");
                try {
                    const details = await API.getByUrl(obj.url);
                    this.openDetails(details, type);
                } catch (err) {
                    Modal.show("<p>Failed to load details. Try again.</p>");
                }
                });
                ul.appendChild(li);
            });

            // jeśli brak wyników
            if (filtered.length === 0) {
                const empty = document.createElement("div");
                empty.className = "submenu-status";
                empty.textContent = "No results.";
                ul.appendChild(empty);
            }
        }




        // debounce 200ms – możesz zmienić np. na 300
        const debouncedFilter = debounce(applyFilter, 250);

        search.addEventListener("input", debouncedFilter);

            

            


            //animacja
        requestAnimationFrame(() => {
            ul.classList.add("show")
        })
      
    },

    openDetails(details, type) {
        let title = details.name || details.title || "Details"
        let html =  `<h2>${title}</h2>`

        if (type === "people") {
            html += `
            <p><strong>Height:</strong> ${details.height} cm</p>
            <p><strong>Mass:</strong> ${details.mass}</p>
            <p><strong>Hair color:</strong> ${details.hair_color}</p>
            <p><strong>Skin color:</strong> ${details.skin_color}</p>
            <p><strong>Birth year:</strong> ${details.birth_year}</p>
            <p><strong>Gender</strong> ${details.gender}</p>
            `
        } else if (type === "planets") {
            html += `
            <p><strong>Climate:</strong> ${details.climate}</p>
            <p><strong>Terrain:</strong> ${details.terrain}</p>
            <p><strong>Population:</strong> ${details.population}</p>
            <p><strong>Gravity:</strong> ${details.gravity}</p>
            <p><strong>Orbital_period:</strong> ${details.orbital_period}</p>
            <p><strong>Rotation period:</strong> ${details.rotation_period}</p>
            `
        } else if (type === "starships") {
            html +=`
            <p><strong>Model:</strong> ${details.model}</p>
            <p><strong>Manufacturer:</strong> ${details.manufacturer}</p>
            <p><strong>Cost:</strong> ${details.cost_in_credits} credits</p>
            <p><strong>Length:</strong> ${details.length}</p>
            <p><strong>Crew:</strong> ${details.crew}</p>
            <p><strong>Passengers:</strong> ${details.passengers}</p>
            <p><strong>Hyperdrive:</strong> ${details.hyperdrive_rating}</p>
            `
        } else if (type === "species") {
            html +=`
            <p><strong>Name:</strong> ${details.name}</p>
            <p><strong>Classification:</strong> ${details.classification}</p>
            <p><strong>Designation:</strong> ${details.designation}</p>
            <p><strong>Average height:</strong> ${details.average_height} cm</p>
            <p><strong>Average lifespan:</strong> ${details.average_lifespan} year</p>
            `
        } else if (type === "vehicles") {
            html +=`
            <p><strong>Model:</strong> ${details.model}</p>
            <p><strong>Manufacturer:</strong> ${details.manufacturer}</p>
            <p><strong>Cost:</strong> ${details.cost_in_credits} credits</p>
            <p><strong>Length:</strong> ${details.length}</p>
            <p><strong>Crew:</strong> ${details.crew}</p>
            <p><strong>Passengers:</strong> ${details.passengers}</p>
            `
        }  else {
            //fallback na wszelki wypadek
            html += `
            <pre style="font-size:12px; white-space:pre-wrap;">
            ${JSON.stringify(details, null, 2)}
            </pre>
            `
        }
        


        Modal.show(html)
    },
    openFromHero(type, submenu) {
    // otwórz sidebar
    this.el.classList.add("open");
    // załaduj dane do odpowiedniego submenu
    this.toggleSubmenu(type, submenu);
    }

}