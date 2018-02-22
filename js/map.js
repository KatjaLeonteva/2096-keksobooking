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
  var PINS_NUM = 5;

  var hotels = [];
  var filters = {
    'housing-type': 'any',
    'housing-price': 'any',
    'housing-rooms': 'any',
    'housing-guests': 'any',
    'housing-features': {
      'filter-wifi': false,
      'filter-dishwasher': false,
      'filter-parking': false,
      'filter-washer': false,
      'filter-elevator': false,
      'filter-conditioner': false
    }
  };

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

      // Первое перемещение метки переводит страницу в активное состояние
      if (!isActive) {
        activateMap();
      }

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
  MAP_FILTERS.addEventListener('change', function(evt) {
    if (evt.target.type === 'checkbox') {
      filters['housing-features'][evt.target.id] = evt.target.checked;
    } else {
      filters[evt.target.id] = evt.target.value;
    }
    window.debounce(renderPins);
  });

  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ

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
   * Отрисовывает метки на карте
   *
   */
  function renderPins() {
    cleanMap();

    var sortedHotels = hotels.slice().sort(function (left, right) {
      var diff = getRank(right) - getRank(left);
      if (diff === 0) {
        diff = calculateDistance(left) - calculateDistance(right);
      }
      return diff;
    });

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < PINS_NUM; i++) {
      fragment.appendChild(window.renderPin(sortedHotels[i]));
    }

    MAP_PINS_ELEMENT.appendChild(fragment);
  }

  /**
   * Возвращает расстояние до главной метки
   *
   * @param {node} pin Метка, от которой считаем расстояние
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

  /**
   * Возвращает ранг отеля для сортировки
   *
   * @param {object} hotel Данные отеля
   * @return {object} rank Рассчитанный ранг
   */
  function getRank(hotel) {
    var rank = 0;

    if (hotel.offer.type === filters['housing-type']) {
      rank += 2;
    }

    if (getPriceCategory(hotel.offer.price) === filters['housing-price']) {
      rank += 2;
    }

    if (hotel.offer.rooms === filters['housing-rooms']) {
      rank += 1;
    }

    if (hotel.offer.guests === filters['housing-guests']) {
      rank += 1;
    }

    hotel.offer.features.forEach(function (feature) {
      if (filters['housing-features']['filter-' + feature]) {
        rank += 1;
      }
    });

    return rank;
  }

  function getPriceCategory(price) {
    if (price < 10000) {
      return 'low';
    } else if (price > 50000) {
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
