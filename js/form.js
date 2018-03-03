/**
 * @fileoverview Модуль, который работает с формой объявления
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var FORM = document.querySelector('.notice__form');
  var FIELDSETS = FORM.querySelectorAll('fieldset');
  var ADDRESS_INPUT = FORM.querySelector('[name="address"]');
  var AVATAR_INPUT = FORM.querySelector('#avatar');
  var AVATAR_PREVIEW = FORM.querySelector('.notice__preview img');
  var TITLE_INPUT = FORM.querySelector('[name="title"]');
  var TYPE_SELECT = FORM.querySelector('[name="type"]');
  var PRICE_INPUT = FORM.querySelector('[name="price"]');
  var ROOMS_SELECT = FORM.querySelector('[name="rooms"]');
  var CAPACITY_SELECT = FORM.querySelector('[name="capacity"]');
  var TIMEIN_SELECT = FORM.querySelector('[name="timein"]');
  var TIMEOUT_SELECT = FORM.querySelector('[name="timeout"]');
  var PHOTOS_INPUT = FORM.querySelector('#images');
  var PHOTOS_CONTAINER = FORM.querySelector('.form__photo-container');
  var FORM_RESET = FORM.querySelector('.form__reset');
  var DROP_ZONES = FORM.querySelectorAll('.drop-zone');

  var DEFAULT_AVATAR = 'img/muffin.png';

  var MIN_PRICES = {
    'flat': 1000,
    'house': 5000,
    'palace': 10000
  };

  var RULES_ROOM_CAPACITY = {
    '1': ['1'],
    '2': ['1', '2'],
    '3': ['1', '2', '3'],
    '100': ['0']
  };

  var INPUT_TYPES_ALLOW_ENTER = ['submit', 'reset', 'file'];

  var photosCache = [];

  // Заполняем поле адреса после открытия страницы
  updateAddress(false);

  // Валидация поля ввода заголовка объявления (ТЗ 2.1)
  TITLE_INPUT.addEventListener('invalid', function (evt) {
    if (evt.target.validity.tooShort) {
      evt.target.setCustomValidity('Заголовок объявления должен состоять минимум из 30 символов');
    } else if (evt.target.validity.tooLong) {
      evt.target.setCustomValidity('Заголовок объявления не должен превышать 100 символов');
    } else if (evt.target.validity.valueMissing) {
      evt.target.setCustomValidity('Обязательное поле');
    } else {
      evt.target.setCustomValidity('');
    }
  });

  // Фикс для Edge (не поддерживает атрибут minlength)
  TITLE_INPUT.addEventListener('input', function (evt) {
    if (evt.target.value.length < 30) {
      evt.target.setCustomValidity('Заголовок объявления должен состоять минимум из 30 символов');
    } else {
      evt.target.setCustomValidity('');
    }
  });

  /**
   * ТЗ 2.3. Поле «Тип жилья» влияет на минимальное значение поля «Цена за ночь»:
   *
   * «Лачуга» — минимальная цена за ночь 0;
   * «Квартира» — минимальная цена за ночь 1 000;
   * «Дом» — минимальная цена 5 000;
   * «Дворец» — минимальная цена 10 000.
   */
  TYPE_SELECT.addEventListener('change', function (evt) {
    setMinPrice(evt.target.value);
  });

  function setMinPrice(propertyType) {
    var minPrice = MIN_PRICES[propertyType] || 0;
    PRICE_INPUT.setAttribute('min', minPrice);
    PRICE_INPUT.setAttribute('placeholder', minPrice);
  }

  // ТЗ 2.2, 2.3. Валидация поля ввода цены
  PRICE_INPUT.addEventListener('invalid', function (evt) {
    if (evt.target.validity.rangeOverflow) {
      var maxPrice = evt.target.getAttribute('max') || '1 000 000';
      evt.target.setCustomValidity('Цена не должна превышать ' + maxPrice + ' руб.');

    } else if (evt.target.validity.rangeUnderflow) {
      var minPrice = evt.target.getAttribute('min') || '0';
      evt.target.setCustomValidity('Для этого типа жилья цена не должна быть ниже ' + minPrice + ' руб.');

    } else if (evt.target.validity.valueMissing) {
      evt.target.setCustomValidity('Обязательное поле');

    } else {
      evt.target.setCustomValidity('');
    }
  });

  PRICE_INPUT.addEventListener('change', function (evt) {
    evt.target.setCustomValidity('');
  });

  /**
   * Т3 2.5. Поля «Время заезда» и «Время выезда» синхронизированы:
   * при изменении значения одного поля, во втором выделяется соответствующее ему.
   * Например, если время заезда указано «после 14»,
   * то время выезда будет равно «до 14» и наоборот.
   */
  TIMEIN_SELECT.addEventListener('change', function () {
    window.utils.syncFields(TIMEIN_SELECT, TIMEOUT_SELECT);
  });

  TIMEOUT_SELECT.addEventListener('change', function () {
    window.utils.syncFields(TIMEOUT_SELECT, TIMEIN_SELECT);
  });

  /**
   * ТЗ 2.6. Поле «Количество комнат» синхронизировано с полем «Количество гостей»,
   * таким образом, что при выборе количества комнат
   * вводятся ограничения на допустимые варианты выбора количества гостей:
   * 1 комната — «для 1 гостя»;
   * 2 комнаты — «для 2 гостей» или «для 1 гостя»;
   * 3 комнаты — «для 3 гостей», «для 2 гостей» или «для 1 гостя»;
   * 100 комнат — «не для гостей».
   *
   * @param {Node} rooms
   * @param {Node} capacity
   * @param {object} rules
   */
  function checkRoomsCapacity(rooms, capacity, rules) {
    var allowedCapacity = rules[rooms.value];

    // Ограничиваем возможность выбора неправильных вариантов
    [].forEach.call(capacity.options, function (option) {
      option.disabled = (allowedCapacity.indexOf(option.value) === -1);
    });

    // Добавляем / убираем сообщение об ошибке
    if (allowedCapacity.indexOf(capacity.value) === -1) {
      capacity.setCustomValidity('Выберите другое количество мест');
    } else {
      capacity.setCustomValidity('');
    }
  }

  ROOMS_SELECT.addEventListener('change', function () {
    checkRoomsCapacity(ROOMS_SELECT, CAPACITY_SELECT, RULES_ROOM_CAPACITY);
  });

  CAPACITY_SELECT.addEventListener('change', function () {
    checkRoomsCapacity(ROOMS_SELECT, CAPACITY_SELECT, RULES_ROOM_CAPACITY);
  });

  // Загрузка фотографии пользователя
  AVATAR_INPUT.addEventListener('change', function (evt) {
    if (evt.target.files.length > 0) {
      window.utils.getFileUrl(evt.target.files[0], function (imageUrl) {
        AVATAR_PREVIEW.src = imageUrl;
      });
    } else {
      AVATAR_PREVIEW.src = DEFAULT_AVATAR;
    }
  });

  // Загрузка фотографий жилья
  PHOTOS_INPUT.addEventListener('change', function (evt) {
    var filesList = evt.target.files;

    if (!filesList.length) {
      return;
    }

    renderPhotos(filesList);
  });

  /**
   * Проверяет загруженные файлы, являются ли они картинками
   * и отрисовывает их в блоке с фотографиями жилья
   *
   * @param {array} files
   */
  function renderPhotos(files) {
    [].forEach.call(files, function (file) {
      window.utils.getFileUrl(file, function (imageUrl) {

        photosCache.push(file);

        var photoElement = document.createElement('div');
        photoElement.classList.add('form__photo');
        photoElement.draggable = true;

        var photo = document.createElement('img');
        photo.src = imageUrl;

        photoElement.appendChild(photo);
        PHOTOS_CONTAINER.appendChild(photoElement);
      });
    });
  }

  // ТЗ 1.7. Нажатие на кнопку .form__reset сбрасывает страницу в исходное неактивное состояние:
  FORM_RESET.addEventListener('click', function (evt) {
    evt.preventDefault();
    deactivateForm();
  });

  FORM.addEventListener('keydown', function (evt) {
    var formElement = evt.target;

    window.utils.isEnterEvent(evt, function () {
      if (formElement.type === 'checkbox') {
        formElement.checked = !formElement.checked;
        evt.preventDefault();
      } else if (INPUT_TYPES_ALLOW_ENTER.indexOf(formElement.type) === -1) {
        evt.preventDefault();
      }
    });
  });

  FORM.addEventListener('submit', function (evt) {
    evt.preventDefault();

    var formData = new FormData(FORM);
    photosCache.forEach(function (photo) {
      formData.append('photos', photo);
    });

    window.backend.save(formData, function () {
      window.message('Данные отправлены успешно!');
      deactivateForm();
    }, function (errorMessage) {
      window.message(errorMessage);
    });
  });

  function activateForm() {
    // Убираем затемнение формы
    FORM.classList.remove('notice__form--disabled');

    // Разблокировка полей формы
    FIELDSETS.forEach(function (fieldset) {
      fieldset.disabled = false;
    });

    // Активация dropzone
    [].forEach.call(DROP_ZONES, function (dropZone) {
      dropZone.addEventListener('dragover', onDropzoneOver, false);
      dropZone.addEventListener('drop', onDropzoneDrop, false);
    });

    // Это нужно, чтобы валидация работала правильно,
    // если пользователь не будет изменять эти поля
    updateAddress(true);
    setMinPrice(TYPE_SELECT.value);
    checkRoomsCapacity(ROOMS_SELECT, CAPACITY_SELECT, RULES_ROOM_CAPACITY);
  }

  function deactivateForm() {
    // Сброс полей формы
    FORM.reset();

    // Сброс фотографий
    AVATAR_PREVIEW.src = DEFAULT_AVATAR;
    window.utils.cleanNode(PHOTOS_CONTAINER, '.form__photo');

    // Деактивация dropzone
    [].forEach.call(DROP_ZONES, function (dropZone) {
      dropZone.removeEventListener('dragover', onDropzoneOver);
      dropZone.removeEventListener('drop', onDropzoneDrop);
    });

    // Блокировка полей формы
    FIELDSETS.forEach(function (fieldset) {
      fieldset.disabled = true;
    });

    // Добавляем затемнение формы
    FORM.classList.add('notice__form--disabled');

    window.map.deactivate();

    updateAddress(false);
  }

  function updateAddress(isActiveMap) {
    var mainPinLocation = window.map.getMainPinLocation(isActiveMap);
    ADDRESS_INPUT.value = mainPinLocation.x + ', ' + mainPinLocation.y;
  }

  function onDropzoneOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  function onDropzoneDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var fileInputId = '#' + evt.target.getAttribute('for');
    if (evt.dataTransfer.files.length) {
      FORM.querySelector(fileInputId).files = evt.dataTransfer.files;
    }
  }

  window.form = {
    activate: activateForm,
    updateAddress: updateAddress
  };
})();
