const Modal = {
    bg: null,
    content: null,
    closeBtn: null,

    init() {
        this.bg = document.getElementById("modal-bg")
        this.content = document.getElementById('modal-content')
        this.closeBtn = document.getElementById("modal-close")

        this.closeBtn.addEventListener("click", () => this.hide())
        this.bg.addEventListener("click", (e) => {
            if (e.target === this.bg) this.hide()
        })

        //ESC zamyka modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.hide()
            }
        })
    },

    show(html) {
        this.content.innerHTML = html;
        this.bg.classList.add("open")
    },

    hide() {
        this.bg.classList.remove("open")
    }
}

Modal.init()