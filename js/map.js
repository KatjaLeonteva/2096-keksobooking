'use strict';

var NUM = 8;
var OFFER_TITLES = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];
var OFFER_TYPE = ['flat', 'house', 'bungalo'];
var OFFER_CHECKIN = ['12:0', '13:00', '14:00'];
var OFFER_CHECKOUT = ['12:0', '13:00', '14:00'];
var OFFER_FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var OFFER_PHOTOS = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jp'];

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
        'avatar': null
      },

      'offer': {
        'title': null,
        'address': null,
        'price': null,
        'type': null,
        'rooms': null,
        'guests': null,
        'checkin': null,
        'checkout': null,
        'features': null,
        'description': null,
        'photos': null
      },

      'location': {
        'x': null,
        'y': null
      }
    };

    noticesData[i] = notice;
  }

  return noticesData;
}

var notices = generateNotices();
