/**
 * @fileoverview Модуль, который отвечает за перетаскивание фотографий жилья
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var FORM = document.querySelector('.notice__form');
  var PHOTOS_CONTAINER = FORM.querySelector('.form__photo-container');

  var draggedItem = null;

  PHOTOS_CONTAINER.addEventListener('dragstart', onDragStart);
  PHOTOS_CONTAINER.addEventListener('dragover', onDragOver);
  PHOTOS_CONTAINER.addEventListener('dragleave', onDragLeave);
  PHOTOS_CONTAINER.addEventListener('drop', onDrop);

  function onDragStart(evt) {
    if (supportsDragDrop(evt.target)) {
      draggedItem = evt.target;
      evt.dataTransfer.effectAllowed = 'move';
      evt.dataTransfer.setData('text/html', evt.target.innerHTML);
    }
  }

  function onDragOver(evt) {
    evt.preventDefault();

    if (supportsDragDrop(evt.target)) {
      evt.target.style.opacity = '0.4';
    }

    return false;
  }

  function onDragLeave(evt) {
    evt.preventDefault();

    if (supportsDragDrop(evt.target)) {
      evt.target.style.opacity = '';
    }

    return false;
  }

  function onDrop(evt) {
    evt.preventDefault();

    if (supportsDragDrop(evt.target)) {
      if (draggedItem !== evt.target) { // Проверка что не переместили на самого себя
        draggedItem.innerHTML = evt.target.innerHTML;
        evt.target.innerHTML = evt.dataTransfer.getData('text/html');
      }
      evt.target.style.opacity = '';
    }

    return false;
  }

  function supportsDragDrop(elem) {
    return elem.classList.contains('form__photo');
  }

})();
