/**
 * @fileoverview Вспомогательные методы
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var ESC_KEYCODE = 27;
  var ENTER_KEYCODE = 13;
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  function isEscEvent(evt, action) {
    if (evt.keyCode === ESC_KEYCODE) {
      action();
    }
  }

  function isEnterEvent(evt, action) {
    if (evt.keyCode === ENTER_KEYCODE) {
      action();
    }
  }

  /**
   * Удаляет потомков из элемента
   *
   * @param {Node} parent Родительский элемент, который нужно очистить
   * @param {string} selector Селектор для потомков (не обязательно)
   */
  function cleanNode(parent, selector) {
    var children = [];
    if (selector) {
      children = parent.querySelectorAll(selector);
    } else {
      children = parent.children;
    }

    for (var i = children.length - 1; i >= 0; i--) {
      parent.removeChild(children[i]);
    }
  }

  function getFileUrl(file, cb) {
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        cb(reader.result);
      });

      reader.readAsDataURL(file);
    }
  }

  window.utils = {
    cleanNode: cleanNode,
    isEscEvent: isEscEvent,
    isEnterEvent: isEnterEvent,
    getFileUrl: getFileUrl
  };
})();
