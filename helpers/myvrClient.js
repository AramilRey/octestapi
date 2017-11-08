const harvesineFormula = require('./harvesineFormula');
const request = require('request-promise-native');
const memoize = require('memoizee');

const makeCall = (uri, queryString = {}, transform = null) => {
  const options = {
    headers: {
      Authorization: process.env.myvrKey || '',
    },
    url: `https://api.myvr.com/v1${uri}`,
    qs: queryString,
    json: true,
  };

  if (typeof transform === 'function') options.transform = transform;

  return request(options);
};

const getList = (filters) => {
  const qs = {};
  const validFilters = ['name', 'dates', 'group', 'minBedrooms', 'maxBedrooms', 'minBathrooms', 'maxBathrooms', 'accommodates', 'order_by'];

  // Add filters as query string
  Object.keys(filters).forEach((filter) => {
    if (validFilters.indexOf(filter) !== -1) qs[filter] = filters[filter];
  });

  // Return API call with transform function
  return makeCall('/properties', qs, body => body.results.map(result => ({
    id: result.id,
    name: result.name,
    active: result.active,
    bedrooms: result.bedrooms,
    lat: result.lat,
    lon: result.lon,
  })));
};

// Return API call with transform function
const getIsNearCoordinates = (propertyId, lat, lon) => makeCall(`/properties/${propertyId}`, {}, body => ({
  id: body.id,
  name: body.name,
  active: body.active,
  bedrooms: body.bedrooms,
  lat: body.lat,
  lon: body.lon,
  near: harvesineFormula(body.lat, body.lon, lat, lon) <= 1,
}));

module.exports = {
  properties: {
    list: memoize(getList, {
      maxAge: 3600000, promise: true, primitive: true, normalizer: args => JSON.stringify(args[0])
    }),
    isNearCoordinates: memoize(getIsNearCoordinates, { maxAge: 3600000, promise: true, primitive: true })
  }
};
