// Модуль, который отвечает за создание карточки объявлений.

'use strict';

(function () {
  /**
   * Создает объявление по шаблону и вставляет в DOM
   *
   * @param {object} cardData Данные для объявления.
   * @param {Node} cardTemplate Шаблон карточки объявления.
   * @param {Node} insertToElement Элемент, в который вставляется карточка.
   * @param {Node} insertBeforeElement Элемент, перед которым вставляется карточка.
   */
  function renderCard(cardData, cardTemplate, insertToElement, insertBeforeElement, clickHandler) {
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

    insertToElement.insertBefore(cardElement, insertBeforeElement);

    cardElement.querySelector('.popup__close').addEventListener('click', function () {
      cardElement.remove();
      clickHandler();
    });
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
