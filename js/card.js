/**
 * @fileoverview Модуль, который отвечает за создание карточки объявлений
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var MAP_ELEMENT = document.querySelector('.map');
  var MAP_FILTERS_ELEMENT = MAP_ELEMENT.querySelector('.map__filters-container');

  var TEMPLATE = document.querySelector('template').content;
  var CARD_TEMPLATE = TEMPLATE.querySelector('article.map__card');

  var ESC_KEYCODE = 27;

  /**
   * Создает объявление по шаблону и вставляет в DOM
   *
   * @param {object} cardData Данные для объявления.
   * @param {function} onCardClose Колбэк по закрытию карточки.
   */
  function renderCard(cardData) {
    // Удаляем открытую карточку (ТЗ 4.3)
    var existingCard = document.querySelector('.map__card');
    if (existingCard) {
      existingCard.remove();
    }

    var cardElement = CARD_TEMPLATE.cloneNode(true);

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

    MAP_ELEMENT.insertBefore(cardElement, MAP_FILTERS_ELEMENT);

    cardElement.querySelector('.popup__close').addEventListener('click', closeCard);

    document.addEventListener('keydown', onEscPress);
  }

  function closeCard() {
    document.querySelector('.map__card').remove();
    document.querySelector('.map__pin--selected').classList.remove('map__pin--selected');
    document.removeEventListener('keydown', onEscPress);
  }

  function onEscPress(evt) {
    if (evt.keyCode === ESC_KEYCODE) {
      closeCard();
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
   * Отрисовывает блок с удобствами
   *
   * @param {array} featuresList Список удобств
   * @param {Node} featuresListElement Родительский элемент
   */
  function renderCardFeatures(featuresList, featuresListElement) {
    var fragment = document.createDocumentFragment();

    window.utils.cleanNode(featuresListElement, null);

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

    window.utils.cleanNode(picturesListElement, null);

    for (var i = 0; i < cardPicturesList.length; i++) {
      var pictureListItem = document.createElement('li');
      var pictureElement = document.createElement('img');
      pictureElement.setAttribute('src', cardPicturesList[i]);
      pictureElement.height = 40;
      pictureElement.style.marginRight = '5px';
      pictureListItem.appendChild(pictureElement);
      fragment.appendChild(pictureListItem);
    }

    picturesListElement.appendChild(fragment);
  }

  window.renderCard = renderCard;
})();
