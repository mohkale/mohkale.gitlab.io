import Player from './player';
import parse from './parser/index'

// See [[file:f:/Avibuso/mohkale.io/src/assets/ascii/README.md][Ascii Assets]].
function runPlayer(elements: HTMLCollectionOf<Element>) {
    if (!elements.length) {
        console.warn('ascii-gif:index', 'ascii-gif loaded while no gifs exist')
        return;
    }

    Array.from(elements).forEach(async function(e) {
        let src = e.getAttribute("data-src");

        if (!src) {
            console.error('ascii-gif:index',
                         'encountered element without src:', e);
            return null;
        }

        await fetch(src)
            .then(resp => {
                if (resp.ok) return resp.text();
                else         throw resp})
            .then(text => parse(text))
            .then(gif => new Player(e, gif))
            .catch((error) => {
                console.error("ascii-gif:index",
                             'failed to fetch art from', src, ': ',
                             error.status, '-', error.statusText,);
        });
    });
}

window.addEventListener('load', () => runPlayer(document.getElementsByClassName("ascii-gif")))
