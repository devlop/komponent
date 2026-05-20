<p align="center">
    <a href="https://www.npmjs.org/package/@devlop-ab/komponent"><img src="https://img.shields.io/npm/v/@devlop-ab/komponent.svg" alt="Latest Stable Version"></a>
    <a href="https://github.com/devlop/komponent/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
</p>

# komponent

bare bones frontend framework for working with frontend components.

# Installing

using npm

```bash
npm install @devlop-ab/komponent
```

# Usage

Create an instance, then register a component for every selector you want to enhance.

```js
import komponent from '@devlop-ab/komponent';

const component = komponent({
    // scopeSelector: '[class^="component"]',
});

component('[data-component="dropdown"]', function (element) {
    // `this` is a Komponent instance scoped to `element`
});
```

Each registered callback runs once per matching element. Elements present at
registration are initialized immediately (or, if the document is still loading,
once `DOMContentLoaded` fires).

# Dynamic components

Elements added to the DOM after registration (AJAX responses, template clones,
markup rendered by another component) are not picked up automatically unless you
opt in.

## refresh

`refresh()` re-scans for matching elements and initializes any new ones. Pass an
element to limit the scan to that subtree, or omit it to scan the whole document.
Already-initialized elements are skipped.

```js
const component = komponent({});

component('[data-component="dropdown"]', callback);

// after inserting new markup
component.refresh();              // scan the whole document
component.refresh(container);     // scan only `container` and its descendants
```

## observe

Set `observe: true` to have komponent watch the DOM with a `MutationObserver`
and initialize matching elements as they appear, with no manual `refresh()`.
It is opt-in and off by default.

```js
const component = komponent({
    observe: true,
});
```

# Teardown

Removing a component's element from the DOM does not detach event listeners that
were registered with `addEventListener` on targets outside the component (for
example `window` or `document`). Call `remove()` on the Komponent instance before
discarding its element, otherwise those listeners leak.
