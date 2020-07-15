/**
 * site-wide search facilities courtesy of [[http://elasticlunr.com/][elasticlunr]].
 */

import elasticlunr from 'elasticlunr';

import { tag, svgIcon } from './utils/template'

// the path to where we can find data about searchable pages.
const SEARCH_INDEX_PATH: string = '/searchindex.json';

// how long to wait after user input before starting a search.
const SEARCH_INPUT_DELAY: number = 600; // ms

// an entry in the search index, TODO populate
interface Entry {}

// Metadata passed to lunrjs to score search parameters.
const SEARCH_PARAMS = {
    fields: {
        title:      {boost: 10},
        tags:       {boost: 5},
        categories: {boost: 5},
        section:    {boost: 3},
        summary:    {boost: 1}
    },
    expand: true
}

const SUMMARY_WORD_COUNT = 50
function stripSummary(summary: string) {
    let splitSum = summary.split(' ')

    if (splitSum.length < SUMMARY_WORD_COUNT) {
        return summary
    } else {
        return splitSum.slice(0, SUMMARY_WORD_COUNT).join(' ') + '...'
    }
}

/* pad any number with zeroes until its {@code base} characters
 * long.
*/
Number.prototype.zeroPad = Number.prototype.zeroPad ||
    function(base){
        let self = this.toString(), selfLen = self.length, len = base - selfLen;

        if (len > 0) {
            return Array(len).fill('0').join('') + self
        } else {
            return self
        }
    };

/* given a search result, construct a HTMLElement to populate and
 * display the result in the DOM.
 */
function renderResult(res: Entry) {
    let date = new Date(res.date)

    let metaSpec = [
        svgIcon('regular-calendar'),
        {
            'name': 'p',
            'class': 'date',
            'textContent': `${date.getUTCFullYear()}.${date.getUTCMonth().zeroPad(2)}.${date.getUTCDate().zeroPad(2)}`
        }
    ]

    if (res.tags) {
        metaSpec.push(svgIcon('solid-tags'))

        let tagsSpec = {
            'name': 'ul',
            'class': 'tags',
            'children': []
        }
        for (let resTag of res.tags) {
            tagsSpec.children.push(tag({
                'name': 'li',
                'children': {
                    'name': 'a',
                    // TODO include tag pagination in searchindex
                    'href': `/tags/${resTag}/`,
                    'textContent': resTag,
                }
            }))
        }
        metaSpec.push(tag(tagsSpec))
    }

    return tag({
        'name': 'li',
        'children': [
            {
                'name': 'h2',
                'children': {
                    'name': 'a',
                    'href': res.uri,
                    'textContent': res.title
                }
            },
            {
                'name': 'div',
                'class': 'content',
                'textContent': stripSummary(res.summary)
            },
            {
                'name': 'div',
                'class': 'meta',
                'children': metaSpec
            }
        ]
    })
}

window.addEventListener('load', function() {
    // TODO guarantee these aren't null.
    const form = document.getElementById('site-search') as HTMLElement;
    const input = document.getElementById('search-input') as HTMLElement;
    const clearButton = document.getElementById('search-clear') as HTMLElement;
    const loader = document.querySelector('.loader-container') as HTMLElement;
    const results = document.getElementById('search-results') as HTMLElement;

    loader.hide = function() {
        loader.classList.add('hidden')
    }

    loader.show = function() {
        loader.classList.remove('hidden')
    }

    loader.hide()

    class Search {
        constructor(entries: Entry[]) {
            this.entries = entries;
            this.index = elasticlunr(function() {
                this.setRef('id')
                this.addField('title');
                this.addField('tags');
                this.addField('categories');
                this.addField('section');
                this.addField('summary');
            });

            (async () => {
                this.entries.forEach(
                    item => this.index.addDoc(item))
            })();

            input.addEventListener('keyup', () => this.inputChanged(input.value));
            clearButton.addEventListener('click', this.clear.bind(this))
        }

        index: elasticlunr.Index;
        lastQuery: string = ""
        entries: Entry[];

        /*
         * perform a search using {@code input} and populate the results
         * ul with the results.
         */
        search(input: string) {
            let res = this.index.search(input, SEARCH_PARAMS);

            if (res.length === 0) {
                results.innerHTML = "<li class=\"search-status\">0 search results</li>"
            } else {
                for (let resRef of res) {
                    let entry = this.entries[resRef.ref]
                    results.appendChild(renderResult(entry))
                }
            }
        }

        clear() {
            if (this.searchTimeoutId) {
                clearTimeout(this.searchTimeoutId);
                this.searchTimeoutId = undefined;
            }

            loader.hide();
            results.innerHTML = "";
            input.value = "";
        }

        // id of callback used to kickstart a search.
        private searchTimeoutId: number

        /*
         * Event handler for when the user input in the search box has
         * changed. Starts a delayed callback which executes the search.
         * If the user inputs something else before the search has begun
         * the callback is cancelled and a new one is started in its place.
         *
         * This way there's no need for a search button, the search is
         * automatically executed when the program determines its ready.
         */
        inputChanged(input: string) {
            if (input === this.lastQuery) {
                return
            }

            results.innerHTML = "";

            if (input.trim() === "") this.clear();
            else {
                if (this.searchTimeoutId)
                    clearTimeout(this.searchTimeoutId);

                this.lastQuery = input;
                loader.show();
                this.searchTimeoutId = setTimeout(() => {
                    loader.hide();
                    this.search(input);
                    this.searchTimeoutId = undefined;
                }, SEARCH_INPUT_DELAY)
            }
        }
    }

    fetch(SEARCH_INDEX_PATH)
        .then((resp: Response) => resp.json())
        .then(resp => new Search(resp))
        .then(r => {
            let url = new URL(document.URL);
            let query = input.value || url.searchParams.get('query')
            if (query) {
                input.value = query
                r.search(query)
            }
        })
        .catch(function(err) {
            console.error('failed to setup search:', err);
        })
})
