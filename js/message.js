'use strict';

(function () {
  window.message = function (messageText) {
    var message = document.createElement('div');

    message.classList.add('message');
    message.textContent = messageText;

    message.addEventListener('click', function (evt) {
      evt.target.remove();
    });

    setTimeout(function () {
      message.remove();
    }, 3000);

    document.body.appendChild(message);
  };
})();
