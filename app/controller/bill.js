'use strict';

const moment = require('moment');

const Controller = require('egg').Controller;

class BillController extends Controller {
  // 添加记录
  async add() {
    const { ctx, app } = this;
    const { amount, type_id, type_name, pay_type, remark = '' } = ctx.request.body;

    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      // 每个账单项的id
      const user_id = decode.id;
      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 记录列表
  async list() {
    const { ctx, app } = this;
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 过滤出月份账单
      const list = await ctx.service.bill.list(user_id);
      const _list = list.filter((item) => {
        if (type_id !== 'all') {
          return moment(Number(item.date)).format('YYYY-MM') === date && type_id === item.type_id;
        }

        return moment(Number(item.date)).format('YYYY-MM') === date;
      });

      let totalExpense = 0,
        totalIncome = 0;

      const listMap = _list
        .reduce((curr, item) => {
          const date = moment(Number(item.date)).format('YYYY-MM-DD');
          // 累计支出
          if (item.pay_type === 1) {
            totalExpense += Number(item.amount);
          }
          // 累计收入
          if (item.pay_type === 2) {
            totalIncome += Number(item.amount);
          }

          if (curr && curr.length) {
            // 将同一时间的账单归结在一个数组
            if (curr.findIndex((item) => item.date === date) > -1) {
              const index = curr.findIndex((item) => item.date === date);
              curr[index].bills.push(item);
            } else {
              curr.push({ date, bills: [item] });
            }
          } else {
            curr.push({ date, bills: [item] });
          }
          return curr;
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date)); // 时间倒叙,新的在上面

      // 分页
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总页数,
          list: filterListMap || [],
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 记录详情接口
  async detail() {
    const { ctx, app } = this;
    const { id = '' } = ctx.query;

    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;
    if (!id) {
      ctx.body = {
        code: 500,
        msg: '订单id不能为空',
        data: null,
      };
      return;
    }
    try {
      // c从数据库获取账单详情
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 编辑账单
  async update() {
    const { ctx, app } = this;
    // 账单的相关参数
    const { id, amount, type_id, type_name, pay_type, remark = '' } = ctx.request.body;
    if (!id || !amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
      return;
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 根据账单id和user_id修改账单数据
      await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 删除记录
  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    if (!id) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
      return;
    }

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      await ctx.service.bill.delete({ id, user_id });
      ctx.body = { code: 200, msg: '删除成功' };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
      };
    }
  }
  // 总支出详细数据用作实现图表需求
  async data() {
    const { ctx, app } = this;
    const { date = '' } = ctx.query;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 获取当月账单数据
      const result = await ctx.service.bill.list(user_id);
      const start = moment(date).startOf('month').unix() * 1000; // 月初
      const end = moment(date).endOf('month').unix() * 1000; // 月份
      const _data = result.filter((item) => Number(item.date) > start && Number(item.date) < end);
      // 总支出
      const total_expense = _data.reduce((arr, cur) => {
        if (cur.pay_type === 1) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);

      // 总收入
      const total_income = _data.reduce((arr, cur) => {
        if (cur.pay_type === 2) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);

      // 获取收支构成
      let total_data = _data.reduce((arr, cur) => {
        const index = arr.findIndex((item) => item.type_id === cur.type_id);
        if (index === -1) {
          arr.push({
            type_id: cur.type_id,
            type_name: cur.type_name,
            pay_type: cur.pay_type,
            number: Number(cur.amount),
          });
        }
        if (index > -1) {
          arr[index].number += Number(cur.amount);
        }
        return arr;
      }, []);

      total_data = total_data.map((item) => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
          total_data: total_data || [],
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '系统错误',
      };
    }
  }
}

module.exports = BillController;
