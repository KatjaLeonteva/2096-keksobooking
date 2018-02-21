/**
 * @fileoverview Сообщение в модальном окне
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  window.message = function (messageText) {
    var message = document.createElement('div');
    message.classList.add('message');

    var messageOverlay = document.createElement('div');
    messageOverlay.classList.add('message__overlay');
    message.appendChild(messageOverlay);

    var messagePopup = document.createElement('div');
    messagePopup.classList.add('message__popup');
    messagePopup.textContent = messageText;
    message.appendChild(messagePopup);

    // Сообщение удаляется по клику на фон
    message.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('message__overlay')) {
        evt.currentTarget.remove();
      }
    });

    // Сообщение удаляется через 5 секунд
    setTimeout(function () {
      message.remove();
    }, 5000);

    document.body.insertBefore(message, document.body.firstChild);
  };
})();
