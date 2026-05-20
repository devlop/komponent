import komponent from '../src/index';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('komponent factory', () => {
    it('initializes elements that already exist on registration', () => {
        const one = document.createElement('div');
        one.className = 'component:menu';

        const two = document.createElement('div');
        two.className = 'component:menu';

        document.body.appendChild(one);
        document.body.appendChild(two);

        const elements : Array<Element> = [];
        const component = komponent({});

        component('.component\\:menu', function (element : Element) {
            elements.push(element);
        });

        expect(elements).toEqual([one, two]);
    });

    it('matches the refresh root itself, not only its descendants', () => {
        const root = document.createElement('div');
        root.className = 'component:card';

        const child = document.createElement('div');
        child.className = 'component:card';

        root.appendChild(child);
        document.body.appendChild(root);

        const elements : Array<Element> = [];
        const component = komponent({});

        component('.component\\:card', function (element : Element) {
            elements.push(element);
        });

        expect(elements).toEqual([root, child]);
    });

    it('does not initialize the same element twice across refreshes', () => {
        const element = document.createElement('div');
        element.className = 'component:tooltip';
        document.body.appendChild(element);

        let calls = 0;
        const component = komponent({});

        component('.component\\:tooltip', function () {
            calls += 1;
        });

        component.refresh();
        component.refresh();

        expect(calls).toBe(1);
    });

    it('isolates a throwing callback and keeps initializing the rest', () => {
        const one = document.createElement('div');
        one.className = 'component:slider';

        const two = document.createElement('div');
        two.className = 'component:slider';

        document.body.appendChild(one);
        document.body.appendChild(two);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        let calls = 0;
        const component = komponent({});

        component('.component\\:slider', function () {
            calls += 1;

            if (calls === 1) {
                throw new Error('boom');
            }
        });

        expect(calls).toBe(2);
        expect(errorSpy).toHaveBeenCalledTimes(1);

        component.refresh();

        expect(calls).toBe(2);

        errorSpy.mockRestore();
    });

    it('catches dynamically added elements when observe is enabled', async () => {
        let calls = 0;
        const component = komponent({ observe: true });

        component('.component\\:dropdown', function () {
            calls += 1;
        });

        expect(calls).toBe(0);

        const element = document.createElement('div');
        element.className = 'component:dropdown';
        document.body.appendChild(element);

        await tick();

        expect(calls).toBe(1);
    });

    it('ignores dynamically added elements when observe is disabled', async () => {
        let calls = 0;
        const component = komponent({});

        component('.component\\:accordion', function () {
            calls += 1;
        });

        const element = document.createElement('div');
        element.className = 'component:accordion';
        document.body.appendChild(element);

        await tick();
        expect(calls).toBe(0);

        component.refresh();
        expect(calls).toBe(1);
    });

    it('defers the initial scan until DOMContentLoaded while the document is loading', () => {
        const element = document.createElement('div');
        element.className = 'component:gallery';
        document.body.appendChild(element);

        Object.defineProperty(document, 'readyState', {
            configurable: true,
            value: 'loading',
        });

        let calls = 0;
        const component = komponent({});

        component('.component\\:gallery', function () {
            calls += 1;
        });

        expect(calls).toBe(0);

        Object.defineProperty(document, 'readyState', {
            configurable: true,
            value: 'complete',
        });
        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(calls).toBe(1);
    });
});
