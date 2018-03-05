'use strict';

(function () {
  var MAP_ELEMENT = document.querySelector('.map');
  var MAP_FILTERS = MAP_ELEMENT.querySelector('.map__filters');

  var FILTER_TYPE = MAP_FILTERS.querySelector('#housing-type');
  var FILTER_PRICE = MAP_FILTERS.querySelector('#housing-price');
  var FILTER_ROOMS = MAP_FILTERS.querySelector('#housing-rooms');
  var FILTER_GUESTS = MAP_FILTERS.querySelector('#housing-guests');
  var FILTER_FEATURES = MAP_FILTERS.querySelector('#housing-features').querySelectorAll('input[type=checkbox]');

  var PRICE_LOW = 10000;
  var PRICE_HIGH = 50000;

  function filterType(hotel) {
    return (FILTER_TYPE.value === 'any' || hotel.offer.type === FILTER_TYPE.value);
  }

  function filterPrice(hotel) {
    return (FILTER_PRICE.value === 'any' || getPriceCategory(hotel.offer.price) === FILTER_PRICE.value);
  }

  function filterRooms(hotel) {
    return (FILTER_ROOMS.value === 'any' || hotel.offer.rooms === parseInt(FILTER_ROOMS.value, 10));
  }

  function filterGuests(hotel) {
    return (FILTER_GUESTS.value === 'any' || hotel.offer.guests === parseInt(FILTER_GUESTS.value, 10));
  }

  function filterFeatures(hotel) {

    return true;
  }

  function getPriceCategory(price) {
    if (price < PRICE_LOW) {
      return 'low';
    } else if (price >= PRICE_HIGH) {
      return 'high';
    } else {
      return 'middle';
    }
  }

  function filterHotels(hotels) {
    return hotels.filter(filterType).filter(filterPrice).filter(filterRooms).filter(filterGuests).filter(filterFeatures);
  }

  window.filter = filterHotels;

})();
