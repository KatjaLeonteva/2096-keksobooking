/**
 * @fileoverview Устранение дребезга
 * @author Екатерина Леонтьева
 */

'use strict';
(function () {
  var DEBOUNCE_INTERVAL = 500; // ТЗ 4.6

  var lastTimeout;
  window.debounce = function (cb) {
    if (lastTimeout) {
      window.clearTimeout(lastTimeout);
    }
    lastTimeout = window.setTimeout(cb, DEBOUNCE_INTERVAL);
  };
})();
