/**
 * @fileoverview Модуль, который создает данные
 * @author Екатерина Леонтьева
 */

'use strict';

(function () {
  var NOTICES_NUM = 8;

  var AUTHOR_AVATARS = generateAvatarLinks(NOTICES_NUM);

  var OFFER_TITLES = [
    'Большая уютная квартира',
    'Маленькая неуютная квартира',
    'Огромный прекрасный дворец',
    'Маленький ужасный дворец',
    'Красивый гостевой домик',
    'Некрасивый негостеприимный домик',
    'Уютное бунгало далеко от моря',
    'Неуютное бунгало по колено в воде'
  ];

  var OFFER_TYPE = ['flat', 'house', 'bungalo'];

  var OFFER_CHECKIN = ['12:00', '13:00', '14:00'];

  var OFFER_CHECKOUT = ['12:00', '13:00', '14:00'];

  var OFFER_FEATURES = [
    'wifi',
    'dishwasher',
    'parking',
    'washer',
    'elevator',
    'conditioner'
  ];

  var OFFER_PHOTOS = [
    'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
    'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
  ];

  var MIN_PRICE = 1000;
  var MAX_PRICE = 1000000;
  var MIN_ROOMS = 1;
  var MAX_ROOMS = 5;
  var MIN_GUESTS = 1;
  var MAX_GUESTS = MAX_ROOMS * 3;
  var MIN_X = 300;
  var MAX_X = 900;
  var MIN_Y = 150;
  var MAX_Y = 500;

  /**
   * Создает массив, состоящий из случайно сгенерированных объектов,
   * которые описывают объявления неподалёку
   *
   * @param {number} noticesNum Количество объявлений.
   * @param {object} noticesOptions Возможные параметры объявлений.
   * @return {array} noticesData Массив объектов с обявлениями.
   */

  function generateNotices(noticesNum, noticesOptions) {
    var noticesData = [];

    // Копируем массивы, чтобы не менять исходные константы
    noticesOptions.authorAvatars = noticesOptions.authorAvatars.slice();
    noticesOptions.offerTitles = noticesOptions.offerTitles.slice();
    noticesOptions.offerPhotos = noticesOptions.offerPhotos.slice();

    for (var i = 0; i < noticesNum; i++) {
      var newNotice = generateRandomNotice(noticesOptions);
      noticesData.push(newNotice);
    }

    return noticesData;
  }

  /**
   * Создает случайное объявление
   *
   * @param {object} options Возможные параметры объявления.
   * @return {object} notice Итоговое объявление.
   */
  function generateRandomNotice(options) {
    var locationX = getRandomInt(options.locationXMin, options.locationXMax);
    var locationY = getRandomInt(options.locationYMin, options.locationYMax);

    var notice = {
      'author': {
        'avatar': getRandomElementUnique(options.authorAvatars)
      },

      'offer': {
        'title': getRandomElementUnique(options.offerTitles),
        'address': locationX + ', ' + locationY,
        'price': getRandomInt(options.priceMin, options.priceMax),
        'type': getRandomElement(options.offerType),
        'rooms': getRandomInt(options.roomsMin, options.roomsMax),
        'guests': getRandomInt(options.guestsMin, options.guestsMax),
        'checkin': getRandomElement(options.offerCheckIn),
        'checkout': getRandomElement(options.offerCheckOut),
        'features': options.offerFeatures.slice(0, getRandomInt(0, options.offerFeatures.length)), // Получаем массив удобств случайной длины, порядок сохраняется
        'description': '',
        'photos': shuffleArray(options.offerPhotos).slice() // Копируем перемешанный массив
      },

      'location': {
        'x': locationX,
        'y': locationY
      }
    };

    return notice;
  }

  /**
   * Создает массив строк с адресами изображений аватаров
   *
   * @param {number} num Длина массива.
   * @return {array} links Итоговый массив.
   */
  function generateAvatarLinks(num) {
    var links = [];

    for (var i = 1; i <= num; i++) {
      var link = 'img/avatars/user' + leadingZeroes(i, 2) + '.png';
      links.push(link);
    }

    return links;
  }

  /**
   * Добавляет 0 перед числом меньше заданной длины
   *
   * @param {number} number Число, перед которым нужно добавить 0.
   * @param {number} length Минимальная длина строки, включая ведущие нули.
   * @return {string} str Итоговая строка.
   */
  function leadingZeroes(number, length) {
    var str = '' + number;

    while (str.length < length) {
      str = '0' + str;
    }

    return str;
  }

  /**
   * Возвращает случайное целое число между min и max (включая оба)
   *
   * @param {number} min Минимальное значение.
   * @param {number} max Максимальное значение.
   * @return {number} Случайное число.
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Возвращает случайный элемент из массива
   *
   * @param {array} arr Массив для поиска элемента.
   * @return {string} Случайный элемент массива.
   */
  function getRandomElement(arr) {
    return arr[getRandomInt(0, arr.length - 1)];
  }

  /**
   * Возвращает случайный элемент и удаляет его из исходного массива
   *
   * @param {array} arr Массив для поиска элемента.
   * @return {string} Случайный элемент массива.
   */
  function getRandomElementUnique(arr) {
    var removedEl = arr.splice(getRandomInt(0, arr.length - 1), 1);
    return removedEl[0];
  }

  /**
   * Перемешивает элементы массива в случайном порядке
   *
   * @param {array} arr Массив, который нужно перемешать.
   * @return {array} arr Итоговый массив.
   */
  function shuffleArray(arr) {
    var currentIndex = arr.length;
    var temporaryValue;
    var randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }

    return arr;
  }

  // Генерируем объявления
  var notices = generateNotices(NOTICES_NUM, {
    authorAvatars: AUTHOR_AVATARS,
    offerTitles: OFFER_TITLES,
    offerType: OFFER_TYPE,
    offerCheckIn: OFFER_CHECKIN,
    offerCheckOut: OFFER_CHECKOUT,
    offerFeatures: OFFER_FEATURES,
    offerPhotos: OFFER_PHOTOS,
    priceMin: MIN_PRICE,
    priceMax: MAX_PRICE,
    roomsMin: MIN_ROOMS,
    roomsMax: MAX_ROOMS,
    guestsMin: MIN_GUESTS,
    guestsMax: MAX_GUESTS,
    locationXMin: MIN_X,
    locationXMax: MAX_X,
    locationYMin: MIN_Y,
    locationYMax: MAX_Y
  });

  window.notices = notices;
})();
