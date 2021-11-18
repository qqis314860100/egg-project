'use strict';

const Service = require('egg').Service;

class BillService extends Service {
  // 添加新纪录
  async add(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 获取列表
  async list(id) {
    const { app } = this;
    const QUERY_STR = 'id,pay_type,amount,date,type_id,type_name,remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 查询记录详情
  async detail(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 修改记录
  async update(params) {
    const { app } = this;
    try {
      // 表名,需要更新的数据内容,查询参数
      const result = await app.mysql.update(
        'bill',
        {
          ...params,
        },
        {
          id: params.id,
          user_id: params.user_id,
        }
      );
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async delete(params) {
    const { app } = this;
    try {
      console.log(params);
      const result = await app.mysql.delete('bill', { ...params });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
