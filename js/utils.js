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
    var nodeChildren = [];
    if (selector) {
      nodeChildren = parent.querySelectorAll(selector);
    } else {
      nodeChildren = parent.children;
    }

    for (var i = nodeChildren.length - 1; i >= 0; i--) {
      parent.removeChild(nodeChildren[i]);
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

  /**
   * Синхронизирует значения селектов.
   * Второму селекту ставит такое же значение, как в первом.
   *
   * @param {Node} select1 Первый селект.
   * @param {Node} select2 Второй селект.
   */
  function syncFields(select1, select2) {
    var value1 = select1.value;
    var options = select2.options;

    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value1) {
        select2.selectedIndex = i;
      }
    }
  }

  window.utils = {
    cleanNode: cleanNode,
    isEscEvent: isEscEvent,
    isEnterEvent: isEnterEvent,
    getFileUrl: getFileUrl,
    syncFields: syncFields
  };
})();
