'use strict';

import ConfigInterface from './ConfigInterface';
import KomponentInterface from './KomponentInterface';

interface RegisteredEventListener
{
    eventTarget : Element,
    type : string
    listener : EventListenerOrEventListenerObject,
    options? : boolean | AddEventListenerOptions | undefined,
};

class Komponent implements KomponentInterface
{
    private config : ConfigInterface;

    private element : Element;

    private listeners : Array<RegisteredEventListener> = [];

    public constructor(config : ConfigInterface, element : Element)
    {
        this.config = config;

        this.element = element;
    }

    /**
     * Add an event listener anywhere in the DOM and keep track of the listener in the Komponent instance
     */
    public addEventListener(
        eventTarget : Element,
        type : string,
        listener : EventListenerOrEventListenerObject,
        options? : boolean | AddEventListenerOptions | undefined,
    ) : void {
        this.listeners.push({
            eventTarget: eventTarget,
            type: type,
            listener: listener,
            options: options,
        });

        eventTarget.addEventListener(type, listener, options);
    }

    /**
     * Removes the component from the DOM tree with any registered event listeners,
     * requires that the event listeners were registered with this.addEventListener
     */
    public remove() : void
    {
        for (let i = 0, imax = this.listeners.length; i < imax; i++) {
            this.listeners[i].eventTarget.removeEventListener(
                this.listeners[i].type,
                this.listeners[i].listener,
                this.listeners[i].options,
            );
        }

        this.element.remove();
    }

    /**
     * Returns the first matching child Element or null if no match
     * Will not return child elements of child components
     */
    public querySelector(selectors : string) : Element | null
    {
        return this.element.querySelector(this.scopedSelector(selectors));
    }

    /**
     * Returns a NodeList containing all matching child Elements
     * Will not return child elements of child components
     */
    public querySelectorAll(selectors : string) : NodeList
    {
        return this.element.querySelectorAll(this.scopedSelector(selectors));
    }

    /**
     * Generate a scoped selector for use in querySelector and querySelectorAll
     */
    private scopedSelector(selectors : string) : string
    {
        const scopeSelector = this.config.scopeSelector;

        if (! scopeSelector) {
            throw new Error('The "scopeSelector" configuration option must be configured to be able to use the scoped querySelector / querySelectorAll methods.');
        }

        const selector = `:is(${selectors}):not(:scope ${scopeSelector} :is(${selectors}))`;

        // console.log(selector);

        // const selector = not + *:is (selector);

        return selector;
    }
}

export default Komponent;

// module.exports = Komponent;

// // Allow use of default import syntax in TypeScript
// module.exports.default = Komponent;
