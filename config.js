var config = {}

config.stormpath = {};
config.parse= {};
config.mandrill = {};
config.redis = {};
config.web = {};
config.session = {};
config.folders = {};

// baseUrl
config.web.baseUrl = 'http://elderalert.herokuapp.com';

// parse configuration
config.parse.appId = 'cyBvaz32pZq15Njaw8NQ1ujsaF8MoAglFlxSNIWO';
config.parse.jsKey = 'nA13ZsrYne3vBn1CNiFjAvRbuLYzde0OtbENNkxv';
config.parse.masterKey = 'RnOezvcQNzDpuh4CX0kCenZ5nYRmHQa0w3ozFb4e';
config.mandrill.apiUser = 'ninajlu@gmail.com';
config.mandrill.apiKey = 'RzKFmwsc9CV7RgrQ-Gjrag';

//session secret
config.session.secret = process.env.EXPRESS_SECRET || "fa2d5588dbef6144f7aa8688577bf89c2ff0686a85d4cbffb0d59779d13ee9e0a5e2c2d9792212c6";

/*
config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis.host = 'hostname';
config.redis.port = 6379;
config.web.port = process.env.WEB_PORT || 9980;
*/


module.exports = config;