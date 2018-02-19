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

  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;

  // Переключаем карту и форму в активное состояние
  function mainPinDragHandler() {
    MAP_ELEMENT.classList.remove('map--faded');
    renderPins(window.notices, MAP_PINS_ELEMENT, PIN_TEMPLATE, PIN_WIDTH, PIN_HEIGHT);

    window.activateForm();
  }

  function deactivateMap() {
    window.utils.cleanNode(MAP_ELEMENT, '.map__card');
    window.utils.cleanNode(MAP_PINS_ELEMENT, '.map__pin:not(.map__pin--main)');
    MAP_ELEMENT.classList.add('map--faded');

    MAP_MAIN_PIN.style.top = '';
    MAP_MAIN_PIN.style.left = '';
  }

  MAP_MAIN_PIN.addEventListener('mouseup', mainPinDragHandler);

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
   * @param {boolean} hasPointer Учитывать ли в расчетах указатель метки.
   * @return {string} Адрес  в формате {{x}}, {{y}}
   */
  function getMainPinLocation(hasPointer) {
    var pinWidth = parseInt(getComputedStyle(MAP_MAIN_PIN).width, 10);
    var pinHeight = parseInt(getComputedStyle(MAP_MAIN_PIN).height, 10);
    var pointerHeight = hasPointer ? parseInt(getComputedStyle(MAP_MAIN_PIN, ':after').borderTopWidth, 10) : 0;

    var locationX = MAP_MAIN_PIN.offsetLeft + pinWidth / 2;
    var locationY = MAP_MAIN_PIN.offsetTop + pinHeight / 2 + pointerHeight;

    return (locationX + ', ' + locationY);
  }

  window.map = {
    getMainPinLocation: getMainPinLocation,
    deactivateMap: deactivateMap
  };
})();
