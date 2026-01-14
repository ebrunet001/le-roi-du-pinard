/**
 * Le Roi du Pinard - Search Module
 */

(function() {
  'use strict';

  class WineSearch {
    constructor() {
      this.wines = [];
      this.searchInput = document.getElementById('search-input');
      this.resultsContainer = document.getElementById('search-results');
      this.debounceTimer = null;

      if (this.searchInput && this.resultsContainer) {
        this.init();
      }
    }

    async init() {
      try {
        const response = await fetch('/data/wines.json');
        if (!response.ok) throw new Error('Failed to load wines data');
        this.wines = await response.json();
        this.bindEvents();
        this.checkUrlParams();
      } catch (error) {
        console.error('Error loading wine data:', error);
        this.resultsContainer.innerHTML = '<p class="search-error">Erreur de chargement des données. Veuillez réessayer.</p>';
      }
    }

    bindEvents() {
      this.searchInput.addEventListener('input', () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.performSearch(), 150);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.searchInput.value = '';
          this.showHint();
        }
      });
    }

    checkUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query) {
        this.searchInput.value = query;
        this.performSearch();
      }
    }

    performSearch() {
      const query = this.searchInput.value.trim();

      if (query.length < 2) {
        this.showHint();
        return;
      }

      const results = this.search(query);
      this.displayResults(results, query);
    }

    search(query) {
      const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);

      return this.wines.filter(wine => {
        const searchable = [
          wine.name || '',
          wine.producer || '',
          wine.region || '',
          wine.appellation || '',
          wine.grape_variety || '',
          wine.color || '',
          wine.classification || ''
        ].join(' ').toLowerCase();

        return terms.every(term => searchable.includes(term));
      }).slice(0, 50);
    }

    displayResults(results, query) {
      if (results.length === 0) {
        this.resultsContainer.innerHTML = `
          <div class="no-results">
            <p>🤷 Aucun vin trouvé pour "<strong>${this.escapeHtml(query)}</strong>"</p>
            <p>Le Roi n'a rien dans sa cave qui corresponde... Essayez avec d'autres termes !</p>
          </div>
        `;
        return;
      }

      const html = `
        <p class="results-count">${results.length} vin${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}</p>
        <div class="search-results-list">
          ${results.map(wine => this.renderResult(wine)).join('')}
        </div>
      `;

      this.resultsContainer.innerHTML = html;
    }

    renderResult(wine) {
      return `
        <a href="/vins/${wine.slug}.html" class="search-result-item">
          <div class="result-color color-${(wine.color || '').toLowerCase().replace('é', 'e')}"></div>
          <div class="result-content">
            <h3>${this.escapeHtml(wine.name)}</h3>
            <p>
              ${this.escapeHtml(wine.producer)}
              ${wine.appellation ? ` • ${this.escapeHtml(wine.appellation)}` : ''}
              ${wine.region ? ` • ${this.escapeHtml(wine.region)}` : ''}
            </p>
            ${wine.classification ? `<span class="badge">${this.escapeHtml(wine.classification)}</span>` : ''}
          </div>
        </a>
      `;
    }

    showHint() {
      this.resultsContainer.innerHTML = '<p class="search-hint">Tapez votre recherche pour explorer les vins du royaume... (minimum 2 caractères)</p>';
    }

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize search when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WineSearch());
  } else {
    new WineSearch();
  }

})();
