/**
 * @fileoverview Модуль, который работает с формой объявления
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var form = document.querySelector('.notice__form');

  // Заполняем поле адреса после открытия страницы
  updateAddress(false);

  // Валидация поля ввода заголовка объявления (ТЗ 2.1)
  var titleInput = form.querySelector('[name="title"]');

  titleInput.addEventListener('invalid', function () {
    if (titleInput.validity.tooShort) {
      titleInput.setCustomValidity('Заголовок объявления должен состоять минимум из 30 символов');
    } else if (titleInput.validity.tooLong) {
      titleInput.setCustomValidity('Заголовок объявления не должен превышать 100 символов');
    } else if (titleInput.validity.valueMissing) {
      titleInput.setCustomValidity('Обязательное поле');
    } else {
      titleInput.setCustomValidity('');
    }
  });

  // Фикс для Edge (не поддерживает атрибут minlength)
  titleInput.addEventListener('input', function (evt) {
    var target = evt.target;
    if (target.value.length < 30) {
      target.setCustomValidity('Заголовок объявления должен состоять минимум из 30 символов');
    } else {
      target.setCustomValidity('');
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
  var typeSelect = form.querySelector('[name="type"]');

  typeSelect.addEventListener('change', function (evt) {
    setMinPrice(evt.target.value);
  });

  function setMinPrice(propertyType) {
    var minPrices = {
      'flat': 1000,
      'house': 5000,
      'palace': 10000
    };
    priceInput.setAttribute('min', minPrices[propertyType] || 0);
  }

  // ТЗ 2.2, 2.3. Валидация поля ввода цены
  var priceInput = form.querySelector('[name="price"]');

  priceInput.addEventListener('invalid', function (evt) {
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

  priceInput.addEventListener('change', function (evt) {
    evt.target.setCustomValidity('');
  });

  /**
   * Т3 2.5. Поля «Время заезда» и «Время выезда» синхронизированы:
   * при изменении значения одного поля, во втором выделяется соответствующее ему.
   * Например, если время заезда указано «после 14»,
   * то время выезда будет равно «до 14» и наоборот.
   */
  var timeinSelect = form.querySelector('[name="timein"]');
  var timeoutSelect = form.querySelector('[name="timeout"]');

  timeinSelect.addEventListener('change', function () {
    syncFields(timeinSelect, timeoutSelect);
  });

  timeoutSelect.addEventListener('change', function () {
    syncFields(timeoutSelect, timeinSelect);
  });

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

  /**
   * ТЗ 2.6. Поле «Количество комнат» синхронизировано с полем «Количество гостей»,
   * таким образом, что при выборе количества комнат
   * вводятся ограничения на допустимые варианты выбора количества гостей:
   * 1 комната — «для 1 гостя»;
   * 2 комнаты — «для 2 гостей» или «для 1 гостя»;
   * 3 комнаты — «для 3 гостей», «для 2 гостей» или «для 1 гостя»;
   * 100 комнат — «не для гостей».
   */
  var roomsSelect = form.querySelector('[name="rooms"]');
  var capacitySelect = form.querySelector('[name="capacity"]');
  var rulesRoomsCapacity = {
    '1': ['1'],
    '2': ['1', '2'],
    '3': ['1', '2', '3'],
    '100': ['0']
  };

  function checkRoomsCapacity(rooms, capacity, rules) {
    var allowedCapacity = rules[rooms.value];

    // Ограничиваем возможность выбора неправильных вариантов
    for (var i = 0; i < capacity.options.length; i++) {
      if (allowedCapacity.indexOf(capacity.options[i].value) === -1) {
        capacity.options[i].disabled = true;
      } else {
        capacity.options[i].disabled = false;
      }
    }

    // Добавляем / убираем сообщение об ошибке
    if (allowedCapacity.indexOf(capacity.value) === -1) {
      capacity.setCustomValidity('Выберите другое количество мест');
    } else {
      capacity.setCustomValidity('');
    }
  }

  roomsSelect.addEventListener('change', function () {
    checkRoomsCapacity(roomsSelect, capacitySelect, rulesRoomsCapacity);
  });

  capacitySelect.addEventListener('change', function () {
    checkRoomsCapacity(roomsSelect, capacitySelect, rulesRoomsCapacity);
  });

  var avatarInput = form.querySelector('#avatar');
  var avatarPreview = form.querySelector('.notice__preview img');
  avatarInput.addEventListener('change', function (evt) {
    avatarPreview.setAttribute('src', URL.createObjectURL(evt.target.files[0]));
  });

  // ТЗ 1.7. Нажатие на кнопку .form__reset сбрасывает страницу в исходное неактивное состояние:
  var formReset = form.querySelector('.form__reset');

  formReset.addEventListener('click', function (evt) {
    evt.preventDefault();
    deactivateForm();
  });

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    window.backend.save(new FormData(form), function () {
      window.message('Данные отправлены успешно!');
      deactivateForm();
    }, function (errorMessage) {
      window.message(errorMessage);
    });
  });

  function activateForm() {
    form.classList.remove('notice__form--disabled');

    var fieldsets = form.querySelectorAll('fieldset');
    for (var i = 0; i < fieldsets.length; i++) {
      fieldsets[i].disabled = false;
    }

    // Это нужно, чтобы валидация работала правильно,
    // если пользователь не будет изменять эти поля
    updateAddress(true);
    setMinPrice(typeSelect.value);
    checkRoomsCapacity(roomsSelect, capacitySelect, rulesRoomsCapacity);
  }

  function deactivateForm() {
    form.reset();
    form.classList.add('notice__form--disabled');

    window.map.deactivateMap();

    updateAddress(false);
  }

  function updateAddress(isActiveMap) {
    var addressInput = form.querySelector('[name="address"]');
    var mainPinLocation = window.map.getMainPinLocation(isActiveMap)
    addressInput.value = 'x: ' + mainPinLocation.x + ', y: ' + mainPinLocation.y;
  }

  window.form = {
    activateForm: activateForm,
    updateAddress: updateAddress
  };
})();
