const url = `
https://firebasestorage.googleapis.com/v0/b/pexeso-6863d.appspot.com/o/packs%2Fanonymous36%2Ffd5bcc40-13f7-49b3-862a-640f36ca1447%2FReact-icon.svg.png?alt=media&token=5463b8f7-cac7-43bf-a3b7-22e62fe0fa54`

const newUrl = url.split('?')[0].split('packs')[1].split('%2F').slice(-1)[0]
console.log(newUrl)

const dict = {
    name: "idk",
    stats: {
        gamesPlayed: 0
    }
}
