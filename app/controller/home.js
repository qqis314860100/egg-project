'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index.html', {
      title: '汤智强',
    });
  }
  async user() {
    const { ctx } = this;
    const { name, slogan } = await ctx.service.home.user();
    console.log(this);

    ctx.body = {
      name,
      slogan,
    };
  }
  async add() {
    const { ctx } = this;
    const { title } = ctx.request.body;
    ctx.body = {
      title,
    };
  }
}

module.exports = HomeController;
