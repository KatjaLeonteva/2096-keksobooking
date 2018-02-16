// Модуль, который отвечает за создание пина — метки на карте.

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

    pinElement.style.left = (pinData.location.x - width / 2) + 'px';
    pinElement.style.top = (pinData.location.y - height) + 'px';

    pinElement.querySelector('img').setAttribute('src', pinData.author.avatar);

    pinElement.addEventListener('click', function () {
      if (pinElement.className.indexOf('map__pin--selected') === -1) {
        clickHandler(pinElement, pinData);
      }
    });

    return pinElement;
  }

  window.renderPin = renderPin;
})();
