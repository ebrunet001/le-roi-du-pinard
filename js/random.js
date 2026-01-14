/**
 * Le Roi du Pinard - Random Wine Module
 */

(function() {
  'use strict';

  let winesData = null;
  let isLoading = false;

  async function loadWines() {
    if (winesData) return winesData;
    if (isLoading) return null;

    isLoading = true;

    try {
      const response = await fetch('/data/wines.json');
      if (!response.ok) throw new Error('Failed to load wines');
      winesData = await response.json();
      return winesData;
    } catch (error) {
      console.error('Error loading wines for random selection:', error);
      return null;
    } finally {
      isLoading = false;
    }
  }

  // Preload wines data on page load for faster random selection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWines);
  } else {
    loadWines();
  }

  // Global function for random wine
  window.randomWine = async function() {
    const wines = await loadWines();

    if (!wines || wines.length === 0) {
      alert('👑 Le Roi n\'a pas pu accéder à sa cave. Veuillez réessayer !');
      return;
    }

    const randomIndex = Math.floor(Math.random() * wines.length);
    const randomWine = wines[randomIndex];

    // Navigate to the random wine page
    window.location.href = '/vins/' + randomWine.slug + '.html';
  };

  // Add keyboard shortcut (Ctrl/Cmd + Shift + R for random)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      window.randomWine();
    }
  });

})();
