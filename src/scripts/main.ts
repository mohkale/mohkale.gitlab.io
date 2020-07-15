import autoWriter, {
    WriteStates     as AutoWriterStates,
    Options         as AutoWriterOptions,
    DEFAULT_OPTIONS as AutoWriterDefaultOptions
} from './auto-writer';

const SUBTITLE_ID = 'subtitle'

// enable auto-writer for the site subtitle/s
document.addEventListener("DOMContentLoaded", function() {
    let subtitle = document.getElementById(SUBTITLE_ID);

    if (subtitle as HTMLElement) {
        let quotesString = subtitle.dataset.alternatives;

        if (quotesString as string) {
            let quotes: string[] = JSON.parse(quotesString);
            if (quotes.length <= 1) {
                return; // don't bother auto writing just one entry.
            }

            let options = Object.assign({}, AutoWriterDefaultOptions);

            // erase the current contents of subtitle to make room
            // for the autowritten entries.
            options.prepopulate = subtitle.textContent.trim()
            subtitle.innerHTML = '';

            let writer = autoWriter(subtitle, quotes, options);
            if (writer as AutoWriter) {
                // shorten the initial-delay to make the autowriter
                // affect obvious.
                writer.waitingTime = 3500;
                writer.begin();
            }
        }
    } else {
        console.warn(`no subtitle field found with id: ${SUBTITLE_ID}`);
    }
});
