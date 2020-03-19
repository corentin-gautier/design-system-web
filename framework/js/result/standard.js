class ResultStandard {
    constructor () {
        this.currentId = null;
        this.savedScrollTop = null;

        MiscEvent.addListener('search:update', this.fillList.bind(this));
    }

    fillCard (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        const cardContainerElement = document.querySelector('.ds44-results .ds44-js-results-container .ds44-js-results-card');
        if (!cardContainerElement) {
            return;
        }

        let scrollTopElement = (document.documentElement || document.body);
        if (cardContainerElement.closest('.ds44-results--mapVisible')) {
            scrollTopElement = cardContainerElement.closest('.ds44-innerBoxContainer');
        }
        this.savedScrollTop = scrollTopElement.scrollTop;
        scrollTopElement.scrollTo({ 'top': 0 });

        MiscEvent.dispatch('loader:requestShow');

        this.currentId = evt.currentTarget.getAttribute('data-id');
        const url = cardContainerElement.getAttribute('data-url');
        MiscRequest.send(
            url + (url.includes('?') ? '&' : '?') + 'q=' + encodeURIComponent(this.currentId),
            this.fillCardSuccess.bind(this),
            this.fillCardError.bind(this)
        );
    }

    fillCardSuccess (result) {
        const cardContainerElement = document.querySelector('.ds44-results .ds44-js-results-container .ds44-js-results-card');
        if (!cardContainerElement) {
            return;
        }

        cardContainerElement.innerHTML = result.content_html;

        const buttonElement = cardContainerElement.querySelector('button');
        if (buttonElement) {
            MiscEvent.addListener('click', this.showList.bind(this), buttonElement);
        }

        this.showCard();

        MiscEvent.dispatch('loader:requestHide');
    }

    fillCardError () {
        // TODO: Show error notification

        MiscEvent.dispatch('loader:requestHide');
    }

    showCard () {
        const containerElement = document.querySelector('.ds44-results .ds44-js-results-container');
        if (!containerElement) {
            return;
        }

        const cardContainerElement = containerElement.querySelector('.ds44-js-results-card');
        if (cardContainerElement) {
            MiscAccessibility.show(cardContainerElement);

            const buttonElement = cardContainerElement.querySelector('button');
            if (buttonElement) {
                window.setTimeout(
                    () => {
                        MiscAccessibility.setFocus(null, '.ds44-results .ds44-js-results-container .ds44-js-results-card button');
                    },
                    600
                );
            }
        }

        containerElement.classList.add('ds44-js-show-card');
        this.focus();
    }

    showList () {
        const containerElement = document.querySelector('.ds44-results .ds44-js-results-container');
        if (!containerElement) {
            return;
        }

        const cardContainerElement = containerElement.querySelector('.ds44-js-results-card');
        if (cardContainerElement) {
            MiscAccessibility.hide(cardContainerElement);
        }

        containerElement.classList.remove('ds44-js-show-card');
        this.blur();

        if (this.currentId) {
            const resultElement = document.querySelector('#search-result-' + this.currentId + ' a');
            if (resultElement) {
                MiscAccessibility.setFocus(resultElement);
            }
            this.currentId = null;
        }
        if (this.savedScrollTop) {
            let scrollTopElement = (document.documentElement || document.body);
            if (containerElement.closest('.ds44-results--mapVisible')) {
                scrollTopElement = containerElement.closest('.ds44-innerBoxContainer');
            }
            scrollTopElement.scrollTo({ 'top': this.savedScrollTop });

            this.savedScrollTop = null;
        }
    }

    fillList (evt) {
        const containerElement = document.querySelector('.ds44-results .ds44-js-results-container');
        if (!containerElement) {
            return;
        }

        const listContainerElement = containerElement.querySelector('.ds44-js-results-list');
        if (!listContainerElement) {
            return;
        }

        // Manage legend
        const legendElement = listContainerElement.querySelector('.ds44-textLegend');
        if (legendElement) {
            if (evt.detail.nbResults > evt.detail.maxResults) {
                legendElement.classList.remove('hidden');
            } else {
                legendElement.classList.add('hidden');
            }
        }

        // Manage title
        let newSearchElement = listContainerElement.querySelector('#ds44-results-new-search');
        if (newSearchElement) {
            newSearchElement.remove();
        }
        let titleElement = listContainerElement.querySelector('.h3-like');
        if (!titleElement) {
            titleElement = document.createElement('p');
            titleElement.className = 'h3-like mbs';
            titleElement.setAttribute('role', 'heading');
            titleElement.setAttribute('aria-level', '2');
            listContainerElement.appendChild(titleElement);
        }
        titleElement.innerText = evt.detail.nbResults + ' résultat' + (evt.detail.nbResults > 1 ? 's' : '');

        // Remove existing results
        let listElement = listContainerElement.querySelector('.ds44-list');
        if (listElement) {
            listElement.remove();
        }
        listElement = document.createElement('ul');
        listElement.className = 'ds44-list ds44-list--results ds44-flex-container';
        listContainerElement.appendChild(listElement);

        // Add new results
        const results = evt.detail.results;
        for (let resultIndex in results) {
            if (!results.hasOwnProperty(resultIndex)) {
                continue;
            }

            const result = results[resultIndex];
            if (
                !result.metadata ||
                !result.metadata.html_list
            ) {
                continue;
            }

            const listItemElement = document.createElement('li');
            listItemElement.setAttribute('id', 'search-result-' + result.id);
            listItemElement.setAttribute('data-id', result.id);
            listItemElement.className = 'ds44-fg1 ds44-js-results-item';
            listItemElement.innerHTML = result.metadata.html_list;
            MiscEvent.addListener('mouseenter', this.focus.bind(this), listItemElement);
            MiscEvent.addListener('mouseleave', this.blur.bind(this), listItemElement);
            const listLinkItemElement = listItemElement.querySelector('a');
            if (listLinkItemElement) {
                MiscEvent.addListener('focus', this.focus.bind(this), listLinkItemElement);
                MiscEvent.addListener('blur', this.blur.bind(this), listLinkItemElement);
            }
            if (containerElement.querySelector('.ds44-js-results-card')) {
                MiscEvent.addListener('click', this.fillCard.bind(this), listItemElement);
            }
            listElement.appendChild(listItemElement);
        }

        this.showList();
    }

    focus (evt = null) {
        const id = (this.currentId || (evt && evt.currentTarget.closest('.ds44-js-results-item').getAttribute('data-id')));
        if (!id) {
            return;
        }

        const markerElement = document.querySelector('#search-marker-' + id);
        if (markerElement) {
            markerElement.classList.add('active');
        }
    }

    blur (evt = null) {
        const id = (this.currentId || (evt && evt.currentTarget.closest('.ds44-js-results-item').getAttribute('data-id')));
        if (!id) {
            return;
        }

        const markerElement = document.querySelector('#search-marker-' + id);
        if (markerElement) {
            markerElement.classList.remove('active');
        }
    }
}

// Singleton
new ResultStandard();
