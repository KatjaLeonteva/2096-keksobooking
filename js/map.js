// Модуль, который управляет карточками объявлений и пинами:
// добавляет на страницу нужную карточку, отрисовывает пины
// и осуществляет взаимодействие карточки и метки на карте.

'use strict';


var MIN_X = 300;
var MAX_X = 900;
var MIN_Y = 150;
var MAX_Y = 500;

var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

var MAP_ELEMENT = document.querySelector('.map');
var MAP_MAIN_PIN = MAP_ELEMENT.querySelector('.map__pin--main');
var MAP_PINS_ELEMENT = MAP_ELEMENT.querySelector('.map__pins');
var MAP_FILTERS_ELEMENT = MAP_ELEMENT.querySelector('.map__filters-container');

// Шаблон
var TEMPLATE = document.querySelector('template').content;

// Шаблон метки
var PIN_TEMPLATE = TEMPLATE.querySelector('.map__pin');

// Шаблон объявления
var CARD_TEMPLATE = TEMPLATE.querySelector('article.map__card');

var FORM = document.querySelector('.notice__form');
var ADDRESS_INPUT = FORM.querySelector('[name="address"]');


/**
 * Вставляет метки в DOM
 *
 * @param {array} pinsData Массив с данными для меток.
 * @param {Node} pinsElement Элемент, куда вставляются метки.
 * @param {Node} pinTemplate Шаблон метки.
 * @param {number} pinWidth Ширина метки.
 * @param {number} pinHeight Высота метки.
 */
function renderPins(pinsData, pinsElement, pinTemplate, pinWidth, pinHeight) {
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < pinsData.length; i++) {
    fragment.appendChild(renderPin(pinsData[i], pinTemplate, pinWidth, pinHeight));
  }

  pinsElement.appendChild(fragment);
}

/**
 * Создает метку по шаблону
 *
 * @param {object} pinData Данные для метки.
 * @param {Node} template Шаблон метки.
 * @param {number} width Ширина метки.
 * @param {number} height Высота метки.
 * @return {Node} pinElement DOM элемент.
 */
function renderPin(pinData, template, width, height) {
  var pinElement = template.cloneNode(true);

  pinElement.style.left = (pinData.location.x - width / 2) + 'px';
  pinElement.style.top = (pinData.location.y - height) + 'px';

  pinElement.querySelector('img').setAttribute('src', pinData.author.avatar);

  pinElement.addEventListener('click', function () {
    if (pinElement.className.indexOf('map__pin--selected') === -1) {
      toggleSelectedPin(MAP_PINS_ELEMENT.querySelectorAll('.map__pin'), pinElement);
      cleanNode(MAP_ELEMENT, '.map__card');
      renderCard(pinData, CARD_TEMPLATE, MAP_ELEMENT, MAP_FILTERS_ELEMENT);
    }
  });

  return pinElement;
}

/**
 * Добавляет класс --selected выбранной метке
 * удаляет этот класс с выбранной ранее метки
 *
 * @param {array} pins Все метки.
 * @param {Node} selectedPin Выбранная метка.
 */
function toggleSelectedPin(pins, selectedPin) {
  for (var i = 0; i < pins.length; i++) {
    pins[i].classList.remove('map__pin--selected');
  }
  selectedPin.classList.add('map__pin--selected');
}

/**
 * Создает объявление по шаблону и вставляет в DOM
 *
 * @param {object} cardData Данные для объявления.
 * @param {Node} cardTemplate Шаблон карточки объявления.
 * @param {Node} insertToElement Элемент, в который вставляется карточка.
 * @param {Node} insertBeforeElement Элемент, перед которым вставляется карточка.
 */
function renderCard(cardData, cardTemplate, insertToElement, insertBeforeElement) {
  var fragment = document.createDocumentFragment();
  var cardElement = cardTemplate.cloneNode(true);

  var cardAvatar = cardElement.querySelector('.popup__avatar');
  cardAvatar.setAttribute('src', cardData.author.avatar);

  var cardTitle = cardElement.querySelector('h3');
  cardTitle.textContent = cardData.offer.title;

  var cardAddress = cardTitle.nextElementSibling.querySelector('small');
  cardAddress.textContent = cardData.offer.address;

  var cardPrice = cardElement.querySelector('.popup__price');
  cardPrice.textContent = cardData.offer.price + '\u20BD\/ночь';

  var cardType = cardElement.querySelector('h4');
  cardType.textContent = getOfferTypeName(cardData.offer.type);

  var cardRoomsGuests = cardType.nextElementSibling;
  cardRoomsGuests.textContent = cardData.offer.rooms + ' комнаты для ' + cardData.offer.guests + ' гостей';

  var cardCheckinCheckout = cardRoomsGuests.nextElementSibling;
  cardCheckinCheckout.textContent = 'Заезд после ' + cardData.offer.checkin + ', выезд до ' + cardData.offer.checkout;

  var cardFeaturesList = cardElement.querySelector('.popup__features');
  renderCardFeatures(cardData.offer.features, cardFeaturesList);

  var cardDescription = cardFeaturesList.nextElementSibling;
  cardDescription.textContent = cardData.offer.description;

  var cardPicturesList = cardElement.querySelector('.popup__pictures');
  renderCardPictures(cardData.offer.photos, cardPicturesList);

  fragment.appendChild(cardElement);
  insertToElement.insertBefore(fragment, insertBeforeElement);

  cardElement.querySelector('.popup__close').addEventListener('click', function () {
    cardElement.remove();
  });
}

/**
 * Отрисовывает блок с удобствами
 *
 * @param {array} featuresList Список удобств
 * @param {Node} featuresListElement Родительский элемент
 */
function renderCardFeatures(featuresList, featuresListElement) {
  var fragment = document.createDocumentFragment();

  cleanNode(featuresListElement, null);

  for (var i = 0; i < featuresList.length; i++) {
    var featureElement = document.createElement('li');
    featureElement.classList.add('feature', 'feature--' + featuresList[i]);
    fragment.appendChild(featureElement);
  }

  featuresListElement.appendChild(fragment);
}

/**
 * Отрисовывает блок с фотографиями
 *
 * @param {array} cardPicturesList Список фотографий
 * @param {Node} picturesListElement Родительский элемент
 */
function renderCardPictures(cardPicturesList, picturesListElement) {
  var fragment = document.createDocumentFragment();

  cleanNode(picturesListElement, null);

  for (var i = 0; i < cardPicturesList.length; i++) {
    var pictureElement = document.createElement('img');
    pictureElement.setAttribute('src', cardPicturesList[i]);
    pictureElement.width = 210;
    fragment.appendChild(pictureElement);
  }

  picturesListElement.appendChild(fragment);
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

/**
 * Возвращает название типа жилья на русском языке
 *
 * @param {string} type Тип жилья.
 * @return {string} Название типа жилья.
 */
function getOfferTypeName(type) {
  var names = {
    'flat': 'Квартира',
    'house': 'Дом',
    'bungalo': 'Бунгало'
  };

  return names[type];
}

/**
 * Заполняет поле адреса координатами,
 * на которые метка указывает своим острым концом.
 *
 * @param {Node} input Поле адреса.
 * @param {Node} pin Метка.
 * @param {boolean} hasPointer Учитывать ли в расчетах указатель метки.
 */
function setAddress(input, pin, hasPointer) {
  var pinWidth = parseInt(getComputedStyle(pin).width, 10);
  var pinHeight = parseInt(getComputedStyle(pin).height, 10);
  var pointerHeight = hasPointer ? parseInt(getComputedStyle(pin, ':after').borderTopWidth, 10) : 0;

  var locationX = pin.offsetLeft + pinWidth / 2;
  var locationY = pin.offsetTop + pinHeight / 2 + pointerHeight;

  input.value = locationX + ', ' + locationY;
}


setAddress(ADDRESS_INPUT, MAP_MAIN_PIN, false);

// Переключаем карту и форму в активное состояние
function mainPinDragHandler() {
  MAP_ELEMENT.classList.remove('map--faded');
  renderPins(notices, MAP_PINS_ELEMENT, PIN_TEMPLATE, PIN_WIDTH, PIN_HEIGHT);

  FORM.classList.remove('notice__form--disabled');

  var fieldsets = FORM.querySelectorAll('fieldset');
  for (var i = 0; i < fieldsets.length; i++) {
    fieldsets[i].disabled = false;
  }

  // Нужно чтобы валидация работала правильно,
  // если пользователь не будет изменять эти поля
  setAddress(ADDRESS_INPUT, MAP_MAIN_PIN, true);
  setMinPrice(typeSelect.value);
  checkRoomsCapacity(roomsSelect, capacitySelect, rulesRoomsCapacity);
}

MAP_MAIN_PIN.addEventListener('mouseup', mainPinDragHandler);

// Валидация поля ввода заголовка объявления (ТЗ 2.1)
var titleInput = FORM.querySelector('[name="title"]');

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
var typeSelect = FORM.querySelector('[name="type"]');

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
var priceInput = FORM.querySelector('[name="price"]');

priceInput.addEventListener('invalid', function () {
  if (priceInput.validity.rangeOverflow) {
    var maxPrice = priceInput.getAttribute('max') || '1 000 000';
    priceInput.setCustomValidity('Цена не должна превышать ' + maxPrice + ' руб.');
  } else if (priceInput.validity.rangeUnderflow) {
    var minPrice = priceInput.getAttribute('min') || '0';
    priceInput.setCustomValidity('Для этого типа жилья цена не должна быть ниже ' + minPrice + ' руб.');
  } else if (priceInput.validity.valueMissing) {
    priceInput.setCustomValidity('Обязательное поле');
  } else {
    priceInput.setCustomValidity('');
  }
});

/**
 * Т3 2.5. Поля «Время заезда» и «Время выезда» синхронизированы:
 * при изменении значения одного поля, во втором выделяется соответствующее ему.
 * Например, если время заезда указано «после 14»,
 * то время выезда будет равно «до 14» и наоборот.
 */
var timeinSelect = FORM.querySelector('[name="timein"]');
var timeoutSelect = FORM.querySelector('[name="timeout"]');

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
var roomsSelect = FORM.querySelector('[name="rooms"]');
var capacitySelect = FORM.querySelector('[name="capacity"]');
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

// ТЗ 1.7. Нажатие на кнопку .form__reset сбрасывает страницу в исходное неактивное состояние:
var formReset = FORM.querySelector('.form__reset');

formReset.addEventListener('click', function (evt) {
  evt.preventDefault();

  // Все заполненные поля стираются
  FORM.reset();

  // Метки похожих объявлений и карточка активного объявления удаляются
  cleanNode(MAP_ELEMENT, '.map__card');
  cleanNode(MAP_PINS_ELEMENT, '.map__pin:not(.map__pin--main)');

  // Карта и форма переходят в неактивное состояние
  MAP_ELEMENT.classList.add('map--faded');
  FORM.classList.add('notice__form--disabled');

  // Метка адреса возвращается в исходное положение
  MAP_MAIN_PIN.style.top = '';
  MAP_MAIN_PIN.style.left = '';

  // Значение поля адреса корректируется соответственно положению метки
  setAddress(ADDRESS_INPUT, MAP_MAIN_PIN, false);
});
