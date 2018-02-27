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
  var MAP_FILTERS = MAP_FILTERS_ELEMENT.querySelector('.map__filters');

  var MAIN_PIN_CORRECTION = 48;
  var PINS_NUM = 5; // ТЗ 4.6

  var hotels = [];
  var filters = {
    'housing': {
      'type': MAP_FILTERS.querySelector('#housing-type').value,
      'price': MAP_FILTERS.querySelector('#housing-price').value,
      'rooms': MAP_FILTERS.querySelector('#housing-rooms').value,
      'guests': MAP_FILTERS.querySelector('#housing-guests').value
    },
    'features': {
      'wifi': MAP_FILTERS.querySelector('#filter-wifi').checked,
      'dishwasher': MAP_FILTERS.querySelector('#filter-dishwasher').checked,
      'parking': MAP_FILTERS.querySelector('#filter-parking').checked,
      'washer': MAP_FILTERS.querySelector('#filter-washer').checked,
      'elevator': MAP_FILTERS.querySelector('#filter-elevator').checked,
      'conditioner': MAP_FILTERS.querySelector('#filter-conditioner').checked
    }
  };

  // Перетаскивание главной метки
  MAP_MAIN_PIN.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    // Первое перемещение метки переводит страницу в активное состояние
    var isActive = !(MAP_ELEMENT.classList.contains('map--faded'));
    if (!isActive) {
      activateMap();
    }

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
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Изменение фильтров
  MAP_FILTERS.addEventListener('change', function (evt) {
    if (evt.target.name === 'features') {
      filters.features[evt.target.value] = evt.target.checked;
    } else {
      var key = evt.target.name.split('-')[1];
      filters.housing[key] = evt.target.value;
    }
    window.debounce(renderPins);
  });

  /**
   * Переводит карту в активное состояние
   *
   */
  function activateMap() {
    MAP_ELEMENT.classList.remove('map--faded');
    window.form.activateForm();

    window.backend.load(function (response) {
      hotels = response;
      renderPins();
      activateFilters();
    }, function (errorMessage) {
      window.message(errorMessage);
    });
  }

  /**
   * Переводит карту в неактивное состояние
   *
   */
  function deactivateMap() {
    cleanMap();
    MAP_ELEMENT.classList.add('map--faded');

    MAP_MAIN_PIN.style.top = '';
    MAP_MAIN_PIN.style.left = '';
  }

  /**
   * Удаляет элементы из карты
   *
   */
  function cleanMap() {
    window.utils.cleanNode(MAP_ELEMENT, '.map__card');
    window.utils.cleanNode(MAP_PINS_ELEMENT, '.map__pin:not(.map__pin--main)');
  }

  /**
   * Разблокирует фильтры (ТЗ 4.7)
   *
   */
  function activateFilters() {
    for (var i = 0; i < MAP_FILTERS.children.length; i++) {
      MAP_FILTERS.children[i].disabled = false;
    }
  }

  /**
   * Отрисовывает метки на карте
   *
   */
  function renderPins() {
    cleanMap(); // ТЗ 4.9

    var filteredHotels = hotels.slice()
        .filter(checkFilters)
        .sort(function (left, right) {
          return calculateDistance(left) - calculateDistance(right);
        });

    var fragment = document.createDocumentFragment();

    var num = Math.min(filteredHotels.length, PINS_NUM);

    for (var i = 0; i < num; i++) {
      fragment.appendChild(window.renderPin(filteredHotels[i]));
    }

    MAP_PINS_ELEMENT.appendChild(fragment);
  }

  function checkFilters(hotel) {
    // Проверяем основные параметры жилья
    for (var prop in filters.housing) {
      if (filters.housing.hasOwnProperty(prop)) {
        var hotelPropValue = hotel.offer[prop];
        if (prop === 'price') {
          hotelPropValue = getPriceCategory(hotelPropValue);
        }
        if ((filters.housing[prop] !== 'any') && (hotelPropValue.toString() !== filters.housing[prop])) {
          return false;
        }
      }
    }
    // Проверяем удобства
    for (var feat in filters.features) {
      if (filters.features.hasOwnProperty(feat)) {
        if (filters.features[feat] === true && hotel.offer.features.indexOf(feat) === -1) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Возвращает расстояние до главной метки
   *
   * @param {node} pin Метка, от которой считаем расстояние
   * @return {number} Расстояние
   */
  function calculateDistance(pin) {
    var dx = (pin.location.x - getMainPinLocation().x);
    var dy = (pin.location.y - getMainPinLocation().y);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
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

  function getPriceCategory(price) {
    if (price < 10000) {
      return 'low';
    } else if (price >= 50000) {
      return 'high';
    } else {
      return 'middle';
    }
  }

  window.map = {
    deactivateMap: deactivateMap,
    getMainPinLocation: getMainPinLocation
  };
})();
