const myvrClient = require('../helpers/myvrClient');
const router = require('koa-router')();

router.prefix('/properties');

// Get houses list
router.get('/', async (ctx) => {
  try {
    ctx.validateQuery('minBedrooms').optional().toInt('minBedrooms must be an integer');
    ctx.validateQuery('accommodates').optional().toInt('accommodates must be an integer');
    ctx.validateQuery('name').optional().toString('name must be a string');

    const qs = ctx.request.query;
    ctx.body = await myvrClient.properties.list(qs);
  } catch (error) {
    ctx.throw(422, error);
  }
});

// Get response of: ${house} is within 1km radius of ${coordinates}?
router.get('/1kmradius', async (ctx) => {
  try {
    ctx.validateQuery('id').required('Parameter id required')
      .isAlphanumeric('Invalid property id');

    ctx.validateQuery('lat')
      .required('Parameter lat required')
      .toDecimal('lat must be a decimal number')
      .gte(-90, 'lat must be bigger than -90')
      .lte(90, 'lat must be smaller than 90');

    ctx.validateQuery('lon')
      .required('Parameter lon required')
      .toDecimal('lon must be a decimal number')
      .gte(-180, 'lon must be bigger than -180')
      .lte(180, 'lat must be smaller than 180');

    const qs = ctx.request.query;
    ctx.body = await myvrClient.properties.isNearCoordinates(qs.id, qs.lat, qs.lon);
  } catch (error) {
    ctx.throw(422, error);
  }
});

// Alternatively
router.get('/:id/1kmradius', async (ctx) => {
  const qs = Object.keys(ctx.request.query).reduce((r, param) => `r${param}=${ctx.request.query[param]}&`, '');
  ctx.redirect(`/api/properties/1kmradius?${qs}id=${ctx.params.id}`);
});


module.exports = router;
