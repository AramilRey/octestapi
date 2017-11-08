require('dotenv').config();
const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const views = require('koa-views');
const koaBody = require('koa-body');
const router = require('koa-router')();
const logger = require('koa-logger');
const bouncer = require('koa-bouncer');
const memProfile = require('memoizee/profile');

// Create app
const app = new Koa();

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Oh, noes!',
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Middleware
app.use(koaBody());
app.use(views(path.join(__dirname, '/views'), { extension: 'html' }));
app.use(bouncer.middleware());
app.use(logger());

// Add home page and cache status routes
router.get('/', async ctx => ctx.render('home'));
router.get('/api/cache', async ctx => ctx.body = memProfile.statistics);
app.use(router.routes(), router.allowedMethods());

// Add API routes
fs.readdirSync(`${__dirname}/routes`).forEach((file) => {
  const route = require(`${__dirname}/routes/${file}`);
  route.prefix('/api');

  app.use(route.routes(), route.allowedMethods());
});

// Specific error handling for 404
app.use(async (ctx) => {
  ctx.status = 404;

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.type = 'html';
      ctx.body = '<p>Page Not Found</p>';
      break;
    case 'json':
      ctx.body = {
        message: 'Page Not Found',
      };
      break;
    default:
      ctx.type = 'text';
      ctx.body = 'Page Not Found';
  }
});

app.listen(3000, () => console.log('app initialized'));
