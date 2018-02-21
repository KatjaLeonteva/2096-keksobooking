/**
 * @fileoverview Модуль, который отвечает за создание пина — метки на карте
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {

  /**
   * Создает метку по шаблону
   *
   * @param {object} pinData Данные для метки.
   * @param {Node} template Шаблон метки.
   * @param {number} width Ширина метки.
   * @param {number} height Высота метки.
   * @param {function} clickHandler Колбэк по клику на невыбранную метку
   * @return {Node} pinElement DOM элемент.
   */
  function renderPin(pinData, template, width, height, clickHandler) {
    var pinElement = template.cloneNode(true);

    pinElement.style.left = (pinData.location.x) + 'px';
    pinElement.style.top = (pinData.location.y - height / 2) + 'px';

    pinElement.querySelector('img').setAttribute('src', pinData.author.avatar);

    pinElement.addEventListener('click', function () {
      if (!pinElement.classList.contains('map__pin--selected')) {
        clickHandler(pinElement, pinData);
      }
    });

    return pinElement;
  }

  window.renderPin = renderPin;
})();
