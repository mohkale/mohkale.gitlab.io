/**
 * In page traversal script adapted from [[https://github.com/jethrokuan/cortex][jethro/cortex]].
 *
 * This script lets you view and open multiple brain notes side-by-side.
 * Clicking on a note just opens it to the right of the current-note.
 */

import URI from 'urijs';

let pages = [window.location.pathname]
const switchDirectionWindowWidth = 900;
const animationLength = 200;

function stackNote(hrefString: string, level: number) {
  level = level || pages.length;
  const href = URI(hrefString);
  const uri = URI(window.location);
  pages.push(href.path());
  uri.setQuery("stackedNotes", pages.slice(1, pages.length));

  const old_pages = pages.slice(0, level - 1);
  const state = { pages: old_pages, level: level };
  window.history.pushState(state, "", uri.href());
}

function unstackNote(level: number) {
  const container = document.querySelector(".grid");
  const children = Array.prototype.slice.call(container.children);

  for (let i = level; i < children.length; i++) {
    container.removeChild(children[i]);
  }
  pages = pages.slice(0, level);
}

function updateLinkStatuses() {
  document
    .querySelectorAll('a')
    .forEach((e: HTMLElement) => {
      if (pages.indexOf(e.getAttribute('href') || '') > -1) {
        e.classList.add('active');
      } else {
        e.classList.remove('active');
      }
    })
}

// Fetches note at href, and then removes all notes up to level, and inserts the new note
async function fetchNote(href: string, level: number) {
  if (pages.indexOf(href) > -1)
    return;
  level = level || pages.length;

  const resp = await fetch(href);
  const text = await resp.text();

  unstackNote(level); // remove target and any subsequent notes.

  const container = document.querySelector(".grid");
  const fragment = document.createElement("template");
  fragment.innerHTML = text;
  const element = fragment.content.querySelector(".page");
  container.appendChild(element);
  stackNote(href, level);

  setTimeout(
    (function(element: HTMLElement, level: number) {
      element.dataset.level = (level + 1).toString();
      initializePage(element, level + 1);
      element.scrollIntoView();
      if (window.MathJax) {
        window.MathJax.typeset();
      }
    }).bind(null, element, level),
    10
  );
}

function initializePage(page: Element, level?: number) {
  level = level || pages.length;
  page
    .querySelectorAll("a")
    .forEach(async function (element) {
      const rawHref = element.getAttribute('href');
      element.dataset.level = level?.toString();

      if (rawHref &&
        // Work with only internal HTML links.
        !(rawHref.indexOf("http://") === 0 ||
          rawHref.indexOf("https://") === 0 ||
          rawHref.indexOf("#") === 0 ||
          rawHref.includes(".pdf") ||
          rawHref.includes(".svg"))) {
        const prefetchLink = element.href;

        return (async function() {
          let testLink = prefetchLink;
          if (testLink.endsWith('/'))
            testLink = testLink.substring(0, testLink.length-1);
          const testParts = testLink.split('/');
          if (/^\d{14}-/.exec(testParts[testParts.length-1])) {
            element.addEventListener("click", function (e) {
              if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                fetchNote(element.getAttribute("href"), Number(this.dataset.level));
              }
            });
          }
          updateLinkStatuses();
        })();
      }
    });
}

window.addEventListener("popstate", function (event) {
  // TODO: check state and pop pages if possible, rather than reloading.
  window.location = window.location; // this reloads the page.
});

window.onload = () => {
  const page = document.querySelector(".page")
  if (!page) {
    console.error('Failed to find root page element.')
    return
  }
  initializePage(page);

  // Restore any notes memorized into the current window URL.
  const uri = URI(window.location);
  if (!uri.hasQuery("stackedNotes")) {
    return;
  }
  let stacks: string[] = [];
  const oldStacks = uri.query(true).stackedNotes as string|string[];
  if (!Array.isArray(oldStacks)) {
    stacks = [oldStacks];
  } else {
    stacks = oldStacks;
  }
  for (let i = 0; i < stacks.length; i++) {
    fetchNote(stacks[i], i + 1);
  }
};
