/**
 * @fileoverview Модуль, который управляет карточками объявлений и пинами:
 * добавляет на страницу нужную карточку, отрисовывает пины
 * и осуществляет взаимодействие карточки и метки на карте.
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var MAP_ELEMENT = document.querySelector('.map');
  var MAP_MAIN_PIN = MAP_ELEMENT.querySelector('.map__pin--main');
  var MAP_PINS_ELEMENT = MAP_ELEMENT.querySelector('.map__pins');
  var MAP_FILTERS_ELEMENT = MAP_ELEMENT.querySelector('.map__filters-container');

  var MAIN_PIN_CORRECTION = 48;
  var PINS_NUM = 5;

  var hotels = [];

  // Перетаскивание главной метки
  MAP_MAIN_PIN.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var isActive = !(MAP_ELEMENT.classList.contains('map--faded'));

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    /**
     * Координаты, ограничивающие перемещение маркера
     * @enum {number}
     */
    var limitCoords = {
      MIN_X: 0,
      MAX_X: MAP_ELEMENT.offsetWidth,
      MIN_Y: 150 - MAIN_PIN_CORRECTION, // Линия горизонта (ТЗ 3.4)
      MAX_Y: MAP_FILTERS_ELEMENT.offsetTop - MAIN_PIN_CORRECTION // Ограничение по ТЗ 3.4
    };

    var onMouseMove = function (moveEvt) {
      moveEvt.preventDefault();

      var shift = {
        x: startCoords.x - moveEvt.clientX,
        y: startCoords.y - moveEvt.clientY
      };

      startCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };

      var pinX = Math.min(Math.max((MAP_MAIN_PIN.offsetLeft - shift.x), limitCoords.MIN_X), limitCoords.MAX_X);
      var pinY = Math.min(Math.max((MAP_MAIN_PIN.offsetTop - shift.y), limitCoords.MIN_Y), limitCoords.MAX_Y);

      MAP_MAIN_PIN.style.left = pinX + 'px';
      MAP_MAIN_PIN.style.top = pinY + 'px';

      window.form.updateAddress(isActive);
      window.debounce(renderPins);
    };

    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (!isActive) {
        activateMap();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function activateMap() {
    MAP_ELEMENT.classList.remove('map--faded');
    window.form.activateForm();

    window.backend.load(function (response) {
      hotels = response;
      renderPins();
    }, function (errorMessage) {
      window.message(errorMessage);
    });
  }

  function deactivateMap() {
    cleanMap();
    MAP_ELEMENT.classList.add('map--faded');

    MAP_MAIN_PIN.style.top = '';
    MAP_MAIN_PIN.style.left = '';
  }

  function cleanMap() {
    window.utils.cleanNode(MAP_ELEMENT, '.map__card');
    window.utils.cleanNode(MAP_PINS_ELEMENT, '.map__pin:not(.map__pin--main)');
  }

  function renderPins() {
    cleanMap();

    var sortedHotels = hotels.slice().sort(compareDistance);

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < PINS_NUM; i++) {
      fragment.appendChild(window.renderPin(sortedHotels[i]));
    }

    MAP_PINS_ELEMENT.appendChild(fragment);
  }

  function compareDistance(a, b) {
    var dxA = (a.location.x - getMainPinLocation().x);
    var dyA = (a.location.y - getMainPinLocation().y);
    var dxB = (b.location.x - getMainPinLocation().x);
    var dyB = (b.location.y - getMainPinLocation().y);
    var distanceA = Math.sqrt(Math.pow(dxA, 2) + Math.pow(dyA, 2));
    var distanceB = Math.sqrt(Math.pow(dxB, 2) + Math.pow(dyB, 2));

    return distanceA - distanceB;
  }

  /**
   * Возвращает положение главной метки на карте
   *
   * @param {boolean} isActive Если карта активная, то делаем поправку на указатель
   * @return {object} Координаты главной метки
   */
  function getMainPinLocation(isActive) {
    var pinCorrection = isActive ? MAIN_PIN_CORRECTION : 0;

    var locationX = MAP_MAIN_PIN.offsetLeft;
    var locationY = MAP_MAIN_PIN.offsetTop + pinCorrection;

    return {x: locationX, y: locationY};
  }

  window.map = {
    deactivateMap: deactivateMap,
    getMainPinLocation: getMainPinLocation
  };
})();
