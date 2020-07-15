// import Swipe from 'swipejs'; // TODO use swipejs to transition.

import { svgIcon } from './utils/template';

const getFigures = () => document.querySelectorAll('figure');

const buttonIcons = {
    fullscreen: 'solid-expand',
    windowed: 'solid-compress',
    quit: 'solid-times',
    left: 'solid-angle-left',
    right: 'solid-angle-right',
};

const getIcon = (function(key: string) {
    if (!this[key]) {
        console.warn('attempted to get non-existant icon for button:', key);
        return null;
    }

    return svgIcon(this[key])
}).bind(buttonIcons)

/**
 * any figures that don't have a figcaption should inherit
 * one from their images `alt` property, or if the image
 * doesn't * have one then just the basename of the images
 * src.
 */
function populateMissingFigcaptions() {
    getFigures()
        .forEach(elem => {
            if (!elem.querySelector('figcaption')) {
                let image = elem.querySelector('img');

                if (image as HTMLImageElement) {
                    let captionText = image.alt || image.src.split("/").reverse()[0]
                    let caption = document.createElement('figcaption');
                    elem.appendChild(caption);
                    let paragraph = document.createElement('p');
                    paragraph.appendChild(document.createTextNode(captionText));
                    caption.appendChild(paragraph);
                } else {
                    console.warn('discovered figure tag with non-existant image:', image);
                }
            }
        });
}

window.addEventListener('load', populateMissingFigcaptions);

function isFullscreen() {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement;
}

function openFullscreen() {
    let docElem = document.documentElement;

    if (docElem.requestFullscreen) {
        docElem.requestFullscreen();
    } else if (docElem.mozRequestFullScreen) {
        docElem.mozRequestFullScreen();
    } else if (docElem.webkitRequestFullscreen) {
        docElem.webkitRequestFullscreen();
    } else if (docElem.msRequestFullscreen) {
        docElem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    if (isFullscreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

class Slideshow {
    root: HTMLElement;
    figures: HTMLElement[];
    exitButton: HTMLElement;
    maximiseButton: HTMLElement;
    minimiseButton: HTMLElement;
    leftButton: HTMLElement;
    rightButton: HTMLElement;
    footer: HTMLElement;
    imageContainer: HTMLElement;
    currentImage: HTMLElement;
    currentImageIndex: number;

    constructor(figures: NodeListOf<HTMLElement>) {
        this.figures = Array.from(figures);
        this.createRoot();

        document.addEventListener('fullscreenchange', this.onFullScreen.bind(this));
        this.onFullScreen();

        this.exitButton.addEventListener('click', () => this.quit());
        this.maximiseButton.addEventListener('click', () => this.setFullScreen(true));
        this.minimiseButton.addEventListener('click', () => this.setFullScreen(false));
        this.leftButton.addEventListener('click', () => this.prev());
        this.rightButton.addEventListener('click', () => this.next());

        // TODO click on underlay to exit.
        // this.root.addEventListener('click', (e) => {
        //     if ([this.imageContainer, this.metaHeader].includes(e.target)) {
        //         this.quit()
        //     }
        // })
    }

    private createRoot() {
        this.root = document.createElement('div');
        this.root.id = "slideshow";

        // RANT why doesn't javascript provide a reasonable HTML
        // builtin templating language... it can be as simple as
        // just converting JSON to XML.

        // -------------- region: Header --------------
        let metaHeader = document.createElement('header');
        this.root.appendChild(metaHeader);

        let pageInfo = document.createElement('p');
        metaHeader.appendChild(pageInfo);
        pageInfo.classList.add("page-info");

        this.currentImage = document.createElement('span');
        pageInfo.appendChild(this.currentImage);
        pageInfo.appendChild(document.createTextNode('/'));
        let pageCountElement = document.createElement('span');
        pageInfo.appendChild(pageCountElement);
        pageCountElement.textContent = `${this.figures.length}`;

        let buttons = document.createElement('div');
        metaHeader.appendChild(buttons);

        this.maximiseButton = getIcon('fullscreen');
        this.maximiseButton.classList.add('maximise', 'button');
        buttons.appendChild(this.maximiseButton);

        this.minimiseButton = getIcon('windowed');
        this.minimiseButton.classList.add('minimise', 'button');
        buttons.appendChild(this.minimiseButton);

        this.exitButton = getIcon('quit');
        this.exitButton.classList.add('exit', 'button');
        buttons.appendChild(this.exitButton);
        // -------------- endregion: Header --------------

        // -------------- region: Main --------------
        let main = document.createElement('div');
        main.classList.add("main");
        this.root.appendChild(main);

        this.leftButton = getIcon('left');
        this.leftButton.classList.add('left-button', 'button');
        main.appendChild(this.leftButton);

        this.imageContainer = document.createElement('div');
        this.imageContainer.classList.add('container');
        main.appendChild(this.imageContainer);

        for (let figure of this.figures) {
            this.imageContainer.appendChild(figure.querySelector('img').cloneNode());
        }

        this.rightButton = getIcon('right');
        this.rightButton.classList.add('right-button', 'button');
        main.appendChild(this.rightButton);
        // -------------- endregion: Main --------------

        // -------------- region: Footer --------------
        this.footer = document.createElement('footer');
        this.root.appendChild(this.footer);
        // -------------- endregion: Footer --------------

        document.querySelector('body').appendChild(this.root);
    }

    setFullScreen(value: boolean) {
        if (value) openFullscreen(); else closeFullscreen();
    }

    onFullScreen() {
        if (isFullscreen()) {
            this.minimiseButton.style.display = "";
            this.maximiseButton.style.display = "none";
        } else {
            this.minimiseButton.style.display = "none";
            this.maximiseButton.style.display = "";
        }
    }

    quit() {
        this.setFullScreen(false);
        this.root.classList.remove('active');
    }

    begin(activeElem: HTMLElement) {
        if (this.figures.length === 0) {
            console.error('slideshow loaded on page with no elements.')
            return;
        }

        this.selectImage(activeElem ? this.figures.indexOf(activeElem) : 0)
        this.root.classList.add('active');
    }

    selectImage(index: number) {
        if (index >= this.figures.length) {
            console.warn('gallery index out of range error:', index, '/', this.figures.length);
            return;
        }

        if (this.currentImageIndex !== undefined) {
            this.imageContainer.querySelector(`:nth-child(${this.currentImageIndex+1})`).classList.remove('active');
        }

        this.currentImage.textContent = `${index+1}`;
        this.currentImageIndex = index;
        let content = this.figures[index].querySelector('figcaption').innerHTML;
        this.footer.innerHTML = content;

        let elem = this.imageContainer.querySelector(`:nth-child(${index+1})`);
        if (elem) {
            elem.classList.add('active');
        }
    }

    next() {
        this.selectImage((this.currentImageIndex + 1) % this.figures.length);
    }

    prev() {
        let index = this.currentImageIndex - 1;
        if (index < 0) index = this.figures.length - 1;
        this.selectImage(index);
    }
}

window.addEventListener('load', function() {
    for (let [_, id] of Object.entries(buttonIcons)) {
        if (!document.getElementById(id)) {
            console.error(`unable to find gallery icon: ${id}`);
            return;
        }
    }

    let figureElems = getFigures();
    let slideshow = new Slideshow(figureElems);

    figureElems
        .forEach(elem =>
            elem.addEventListener('click', function() {
                slideshow.begin(this);
            }));
});
