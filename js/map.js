// Модуль, который управляет карточками объявлений и пинами:
// добавляет на страницу нужную карточку, отрисовывает пины
// и осуществляет взаимодействие карточки и метки на карте.

'use strict';

(function () {
  var MAP_ELEMENT = document.querySelector('.map');
  var MAP_MAIN_PIN = MAP_ELEMENT.querySelector('.map__pin--main');
  var MAP_PINS_ELEMENT = MAP_ELEMENT.querySelector('.map__pins');
  var MAP_FILTERS_ELEMENT = MAP_ELEMENT.querySelector('.map__filters-container');

  var TEMPLATE = document.querySelector('template').content;
  var PIN_TEMPLATE = TEMPLATE.querySelector('.map__pin');
  var CARD_TEMPLATE = TEMPLATE.querySelector('article.map__card');

  var MAIN_PIN_CORRECTION = 48;
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  // Перетаскивание главной метки
  MAP_MAIN_PIN.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var isActive = (MAP_ELEMENT.className.indexOf('map--faded') === -1);

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    var limitCoords = {
      minX: 0,
      maxX: MAP_ELEMENT.offsetWidth,
      minY: 150 - MAIN_PIN_CORRECTION, // Линия горизонта (ТЗ 3.4)
      maxY: MAP_FILTERS_ELEMENT.offsetTop - MAIN_PIN_CORRECTION // Ограничение по ТЗ 3.4
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

      var pinX = Math.min(Math.max((MAP_MAIN_PIN.offsetLeft - shift.x), limitCoords.minX), limitCoords.maxX);
      var pinY = Math.min(Math.max((MAP_MAIN_PIN.offsetTop - shift.y), limitCoords.minY), limitCoords.maxY);

      MAP_MAIN_PIN.style.left = pinX + 'px';
      MAP_MAIN_PIN.style.top = pinY + 'px';

      window.form.updateAddress(isActive);
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
      renderPins(response, MAP_PINS_ELEMENT, PIN_TEMPLATE, PIN_WIDTH, PIN_HEIGHT);
    }, function (errorMessage) {
      console.log(errorMessage);
    });
  }

  function deactivateMap() {
    window.utils.cleanNode(MAP_ELEMENT, '.map__card');
    window.utils.cleanNode(MAP_PINS_ELEMENT, '.map__pin:not(.map__pin--main)');
    MAP_ELEMENT.classList.add('map--faded');

    MAP_MAIN_PIN.style.top = '';
    MAP_MAIN_PIN.style.left = '';
  }

  /**
   * Вставляет метки в DOM
   *
   * @param {array} pinsData Массив с данными для меток.
   * @param {Node} pinsElement Элемент, куда вставляются метки.
   * @param {Node} pinTemplate Шаблон метки.
   * @param {number} pinWidth Ширина метки.
   * @param {number} pinHeight Высота метки.
   */
  function renderPins(pinsData, pinsElement, pinTemplate, pinWidth, pinHeight) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < pinsData.length; i++) {
      fragment.appendChild(window.renderPin(pinsData[i], pinTemplate, pinWidth, pinHeight, pinClickHandler));
    }

    pinsElement.appendChild(fragment);
  }

  /**
   * События по клику на метку
   *
   * @param {Node} selectedPinElement Метка.
   * @param {object} selectedPinData Данные метки.
   */
  function pinClickHandler(selectedPinElement, selectedPinData) {
    // Переключает класс
    toggleSelectedPin(MAP_PINS_ELEMENT.querySelectorAll('.map__pin'), selectedPinElement);

    // Удаляет карточки
    window.utils.cleanNode(MAP_ELEMENT, '.map__card');

    // Отрисовывает карточку для выбранной метки
    window.renderCard(selectedPinData, CARD_TEMPLATE, MAP_ELEMENT, MAP_FILTERS_ELEMENT);
  }

  /**
   * Добавляет класс --selected выбранной метке
   * удаляет этот класс с выбранной ранее метки
   *
   * @param {array} pins Все метки.
   * @param {Node} selectedPin Выбранная метка.
   */
  function toggleSelectedPin(pins, selectedPin) {
    for (var i = 0; i < pins.length; i++) {
      pins[i].classList.remove('map__pin--selected');
    }
    selectedPin.classList.add('map__pin--selected');
  }

  /**
   * Возвращает положение главной метки на карте
   *
   * @param {boolean} isActive Если карта активная, то делаем поправку на указатель
   * @return {string} Адрес  в формате {{x}}, {{y}}
   */
  function getMainPinLocation(isActive) {
    var pinCorrection = isActive ? MAIN_PIN_CORRECTION : 0;

    var locationX = MAP_MAIN_PIN.offsetLeft;
    var locationY = MAP_MAIN_PIN.offsetTop + pinCorrection;

    return (locationX + ', ' + locationY);
  }

  window.map = {
    deactivateMap: deactivateMap,
    getMainPinLocation: getMainPinLocation
  };
})();
