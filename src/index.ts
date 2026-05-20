'use strict';

import ConfigInterface from './ConfigInterface';
import KomponentFactoryInterface from './KomponentFactoryInterface';
import Komponent from './Komponent';

export type { default as ConfigInterface } from './ConfigInterface';
export type { default as KomponentFactoryInterface } from './KomponentFactoryInterface';

interface Rule
{
    selector : string,
    callback : Function,
    initialized : WeakSet<Element>,
};

const constructor = function (config : ConfigInterface) : KomponentFactoryInterface {
    const rules : Array<Rule> = [];

    let observer : MutationObserver | null = null;

    const initialize = function (element : Element, rule : Rule) : void {
        if (rule.initialized.has(element)) {
            return;
        }

        rule.initialized.add(element);

        try {
            rule.callback.call(new Komponent(config, element), element);
        } catch (error) {
            console.error(error);
        }
    };

    const scan = function (root : Element) : void {
        for (let i = 0, imax = rules.length; i < imax; i++) {
            const rule = rules[i];

            if (root.matches(rule.selector)) {
                initialize(root, rule);
            }

            root.querySelectorAll(rule.selector).forEach(function (element) {
                initialize(element, rule);
            });
        }
    };

    const startObserver = function () : void {
        if (observer) {
            return;
        }

        observer = new MutationObserver(function (mutations) {
            for (let i = 0, imax = mutations.length; i < imax; i++) {
                mutations[i].addedNodes.forEach(function (node) {
                    if (node instanceof Element) {
                        scan(node);
                    }
                });
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    };

    const factory = function (selector : string, callback : Function) : void {
        rules.push({
            selector: selector,
            callback: callback,
            initialized: new WeakSet<Element>(),
        });

        if (config.observe) {
            startObserver();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                scan(document.documentElement);
            }, { once: true });
        } else {
            scan(document.documentElement);
        }
    } as KomponentFactoryInterface;

    factory.refresh = function (root? : Element) : void {
        scan(root ?? document.documentElement);
    };

    return factory;
};

export default constructor;
