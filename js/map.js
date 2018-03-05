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

  var MAIN_PIN_WIDTH = parseInt(getComputedStyle(MAP_MAIN_PIN).width, 10);
  var MAIN_PIN_CORRECTION = 48;
  var PINS_NUM = 5; // ТЗ 4.6

  var hotels = [];

  // Нажатие на enter на главной метке
  MAP_MAIN_PIN.addEventListener('keydown', function (evt) {
    window.utils.isEnterEvent(evt, activateMap);
  });

  // Перетаскивание главной метки
  MAP_MAIN_PIN.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    /**
     * Координаты, ограничивающие перемещение маркера
     * @enum {number}
     */
    var limitCoords = {
      MIN_X: MAIN_PIN_WIDTH / 2,
      MAX_X: MAP_ELEMENT.offsetWidth - MAIN_PIN_WIDTH / 2,
      MIN_Y: 150 - MAIN_PIN_CORRECTION, // Линия горизонта (ТЗ 3.4)
      MAX_Y: 500 - MAIN_PIN_CORRECTION // Ограничение по ТЗ 3.4
    };

    function onMouseMove(moveEvt) {
      moveEvt.preventDefault();

      // Первое перемещение метки переводит страницу в активное состояние
      activateMap();

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

      window.form.updateAddress(true);
      window.debounce(renderPins);
    }

    function onMouseUp(upEvt) {
      upEvt.preventDefault();

      // Если перемещения не было, страница активируется при отпускании мыши
      activateMap();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Изменение фильтров
  MAP_FILTERS.addEventListener('change', function () {
    window.debounce(renderPins);
  });

  // Изменение фильтров по нажатию на enter
  MAP_FILTERS.addEventListener('keydown', function (evt) {
    window.utils.isEnterEvent(evt, function () {
      if (evt.target.name === 'features') {
        evt.target.checked = !evt.target.checked;
        window.debounce(renderPins);
      }
    });
  });

  /**
   * Проверяет состояние карты
   * Переводит карту в активное состояние
   *
   */
  function activateMap() {
    if (MAP_ELEMENT.classList.contains('map--faded')) {
      MAP_ELEMENT.classList.remove('map--faded');
      window.form.activate();

      window.backend.load(function (response) {
        hotels = response;
        renderPins();
        activateFilters();
      }, function (errorMessage) {
        window.message(errorMessage);
      });
    }
  }

  /**
   * Переводит карту в неактивное состояние
   *
   */
  function deactivateMap() {
    cleanMap();
    deactivateFilters();

    MAP_MAIN_PIN.style.top = '';
    MAP_MAIN_PIN.style.left = '';

    MAP_ELEMENT.classList.add('map--faded');
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
   * Разблокировка фильтров (ТЗ 4.7)
   *
   */
  function activateFilters() {
    [].forEach.call(MAP_FILTERS.children, function (filter) {
      filter.disabled = false;
    });
  }

  /**
   * Блокировка фильтров
   *
   */
  function deactivateFilters() {
    [].forEach.call(MAP_FILTERS.children, function (filter) {
      filter.disabled = true;
    });
  }

  /**
   * Отрисовывает метки на карте
   *
   */
  function renderPins() {
    cleanMap(); // ТЗ 4.9

    // Фильтруем объявления
    var filteredHotels = window.filter(hotels.slice());

    // Сортируем по расстоянию
    filteredHotels.sort(function (left, right) {
      return calculateDistance(left) - calculateDistance(right);
    });

    var fragment = document.createDocumentFragment();

    var num = Math.min(filteredHotels.length, PINS_NUM);

    for (var i = 0; i < num; i++) {
      fragment.appendChild(window.renderPin(filteredHotels[i]));
    }

    MAP_PINS_ELEMENT.appendChild(fragment);
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

  window.map = {
    deactivate: deactivateMap,
    getMainPinLocation: getMainPinLocation
  };
})();
