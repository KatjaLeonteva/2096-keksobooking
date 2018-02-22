/**
 * @fileoverview Модуль, который отвечает за создание пина — метки на карте
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var TEMPLATE = document.querySelector('template').content;
  var PIN_TEMPLATE = TEMPLATE.querySelector('.map__pin');
  var PIN_HEIGHT = 70;

  /**
   * Создает метку по шаблону
   *
   * @param {object} pinData Данные для метки.
   * @return {Node} pinElement DOM элемент.
   */
  function renderPin(pinData) {
    var pinElement = PIN_TEMPLATE.cloneNode(true);

    pinElement.style.left = (pinData.location.x) + 'px';
    pinElement.style.top = (pinData.location.y - PIN_HEIGHT / 2) + 'px';

    pinElement.querySelector('img').setAttribute('src', pinData.author.avatar);

    pinElement.addEventListener('click', function () {
      if (!pinElement.classList.contains('map__pin--selected')) {
        pinClickHandler(pinElement, pinData);
      }
    });

    return pinElement;
  }

  /**
   * События по клику на метку
   *
   * @param {Node} selectedPinElement Метка.
   * @param {object} selectedPinData Данные метки.
   */
  function pinClickHandler(selectedPinElement, selectedPinData) {
    // Переключает класс
    toggleSelectedPin(selectedPinElement);

    // Отрисовывает карточку для выбранной метки
    window.renderCard(selectedPinData, function () {
      selectedPinElement.classList.remove('map__pin--selected');
    });
  }

  /**
   * Добавляет класс --selected выбранной метке
   * удаляет этот класс с выбранной ранее метки
   *
   * @param {Node} selectedPin Выбранная метка.
   */
  function toggleSelectedPin(selectedPin) {
    var pins = selectedPin.parentNode.querySelectorAll('.map__pin');

    for (var i = 0; i < pins.length; i++) {
      pins[i].classList.remove('map__pin--selected');
    }

    selectedPin.classList.add('map__pin--selected');
  }

  window.renderPin = renderPin;
})();
