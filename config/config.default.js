/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1637061399355_7625';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: 'app/public/upload',
  };

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ['*'],
  };
  config.mysql = {
    client: {
      host: '47.105.36.18',
      port: '3306',
      user: 'root',
      password: '123456',
      database: 'juejue-cost',
    },
    app: true,
    agent: false,
  };
  config.view = {
    mapping: { '.html': 'ejs' },
  };
  config.jwt = {
    secret: 'tomtong',
  };
  config.multipart = {
    mode: 'file',
  };
  config.cors = {
    origin: '*', // 允许所有跨域访问
    credentials: true, // 允许cookie跨域
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return {
    ...config,
    ...userConfig,
  };
};
