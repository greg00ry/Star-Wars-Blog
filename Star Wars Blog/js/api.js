const API = {
    async getList(type, page = 1) {
        try {
            const res = await fetch(`https://swapi.dev/api/${type}/?page=${page}`)
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }
            const data = await res.json()
            return {
                items: data.results,
                next: data.next,
                prev: data.previous,
                total: data.count,
                page
            }
        }catch (err) {
            console.error("getList error:",err);
        }
    },

    async getByUrl(url) {
         try {
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }
            return res.json()
         } catch (err) {
            console.error("getByUrl error:", err);
            throw err
        }   
    }
}