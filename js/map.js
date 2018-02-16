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

// var FORM = document.querySelector('.notice__form');
// var ADDRESS_INPUT = FORM.querySelector('[name="address"]');


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
