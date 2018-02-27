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
   */
  function renderCard(cardData) {
    // Удаляем открытую карточку (ТЗ 4.3)
    var existingCard = document.querySelector('.map__card');
    if (existingCard) {
      existingCard.remove();
    }

    var cardElement = CARD_TEMPLATE.cloneNode(true);
    var cardAvatar = cardElement.querySelector('.popup__avatar');
    var cardTitle = cardElement.querySelector('h3');
    var cardAddress = cardTitle.nextElementSibling.querySelector('small');
    var cardPrice = cardElement.querySelector('.popup__price');
    var cardType = cardElement.querySelector('h4');
    var cardRoomsGuests = cardType.nextElementSibling;
    var cardCheckinCheckout = cardRoomsGuests.nextElementSibling;
    var cardFeaturesList = cardElement.querySelector('.popup__features');
    var cardDescription = cardFeaturesList.nextElementSibling;
    var cardPicturesList = cardElement.querySelector('.popup__pictures');

    cardAvatar.setAttribute('src', cardData.author.avatar);
    renderCardText(cardTitle, cardData.offer.title);
    renderCardText(cardAddress, cardData.offer.address);
    renderCardText(cardPrice, cardData.offer.price + '\u20BD\/ночь');
    renderCardText(cardType, getOfferTypeName(cardData.offer.type));
    renderCardText(cardRoomsGuests, cardData.offer.rooms + ' комнаты для ' + cardData.offer.guests + ' гостей');
    renderCardText(cardCheckinCheckout, 'Заезд после ' + cardData.offer.checkin + ', выезд до ' + cardData.offer.checkout);
    renderCardText(cardDescription, cardData.offer.description);
    renderCardFeatures(cardData.offer.features, cardFeaturesList);
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

  function renderCardText(element, text) {
    if (text) {
      element.textContent = text;
    } else {
      element.remove();
    }
  }

  /**
   * Отрисовывает блок с удобствами
   *
   * @param {array} featuresList Список удобств
   * @param {Node} featuresListElement Родительский элемент
   */
  function renderCardFeatures(featuresList, featuresListElement) {
    if (featuresList.length > 0) {
      var fragment = document.createDocumentFragment();

      window.utils.cleanNode(featuresListElement, null);

      for (var i = 0; i < featuresList.length; i++) {
        var featureElement = document.createElement('li');
        featureElement.classList.add('feature', 'feature--' + featuresList[i]);
        fragment.appendChild(featureElement);
      }

      featuresListElement.appendChild(fragment);
    } else {
      featuresListElement.remove();
    }

  }

  /**
   * Отрисовывает блок с фотографиями
   *
   * @param {array} cardPicturesList Список фотографий
   * @param {Node} picturesListElement Родительский элемент
   */
  function renderCardPictures(cardPicturesList, picturesListElement) {
    if (cardPicturesList.length > 0) {
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
    } else {
      picturesListElement.remove();
    }
  }

  window.renderCard = renderCard;
})();
