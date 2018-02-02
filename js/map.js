'use strict';

var NUM = 8;
var OFFER_TITLES = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];
var OFFER_TYPE = ['flat', 'house', 'bungalo'];
var OFFER_CHECKIN = ['12:00', '13:00', '14:00'];
var OFFER_CHECKOUT = ['12:00', '13:00', '14:00'];
var OFFER_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var OFFER_PHOTOS = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jp'];

var MIN_PRICE = 1000;
var MAX_PRICE = 1000000;
var MIN_ROOMS = 1;
var MAX_ROOMS = 5;
var MIN_X = 300;
var MAX_X = 900;
var MIN_Y = 150;
var MAX_Y = 500;

/**
 * Создает массив, состоящий из случайно сгенерированных объектов,
 * которые описывают объявления неподалёку
 *
 * @return {array} noticesData Массив объектов с обявлениями.
 */
function generateNotices() {
  var noticesData = [];

  for (var i = 0; i < NUM; i++) {
    var notice = {
      'author': {
        'avatar': 'img/avatars/user' + '0' + getRandomInt(1, 8) + '.png'
      },

      'offer': {
        'title': null,
        'address': null,
        'price': getRandomInt(MIN_PRICE, MAX_PRICE),
        'type': getRandomElement(OFFER_TYPE),
        'rooms': getRandomInt(MIN_ROOMS, MAX_ROOMS),
        'guests': null,
        'checkin': getRandomElement(OFFER_CHECKIN),
        'checkout': getRandomElement(OFFER_CHECKOUT),
        'features': null,
        'description': '',
        'photos': null
      },

      'location': {
        'x': getRandomInt(MIN_X, MAX_X),
        'y': getRandomInt(MIN_Y, MAX_Y)
      }
    };

    noticesData[i] = notice;
  }

  return noticesData;
}

var notices = generateNotices();
console.log(notices);

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
