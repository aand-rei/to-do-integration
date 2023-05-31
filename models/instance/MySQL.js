const mysql = require("mysql2");

module.exports = class MySQL {

    constructor(config,options = {}) {
        this.connection = mysql.createConnection(config).promise();
        this.options = options;
        this.body = [];
        this.setTable();
    }

    async push(data){
        let result = await this.query(this.getInsertQuery(data));
        this.lastResult = result;
        return result ? result.insertId : null
    }

    async pushArray(data = []){
        if(data.length === 0) return;
        await this.query(this.getMultipleInsertQuery(data));
    }

    async update(data,options){
        let result = await this.query(this.getUpdateQuery(data,options));
        this.lastResult = result;
        return result ? result.changedRows : null
    }

    async get(options){
        this.body = [];
        let result = await this.query(this.getSelectQueryStr(options));
        return result;
    }

    async delete(options){
        let result = await this.query(this.getDeleteQuery(options));
        return result ? result.affectedRows : null
    }
    async exists(options){
        let result = await this.get(options);
        return result && result[0] ? result[0] : false;
    }



    setWhere(obj,delimiter = 'AND'){
        if(obj){
            this.whereBody = Object.values(obj);
            this.where = Object.keys(obj).map(key => {
                let [k,com] = key.split('__');
                return `${k} ${com || '='} ?`
            }).join(` ${delimiter} `);
        }else{
            this.where = '';
        }
        return this;

    }

    end(cb){
        if(!this.closed) this.connection.end(cb);
        this.closed = true;
        return this;
    }

    async rowCount(key = 'id'){
        let result = await this.query(`SELECT COUNT(${key}) AS num FROM ${this.table}`);
        return result[0].num;
    }

    query(str){
        if(!this.table) throw('MySQL table undefined');
        let body = [].concat(this.body,this.whereBody);
        return this.connection.query(str,body)
            .then(result => {
                return result[0]
            })
            .catch(err =>{
                console.log(err);
            });
    }

    setTable(name){
        name = name ? name : this.options.table;
        this.table = name;
        this.body = [];
        return this;
    }

    getSelectQueryStr(options = {}){
        options.where = options.where || this.where;
        if(options.whereFillers) this.whereBody = options.whereFillers;
        let opt = {...this.defaultOptions,...options},
            filter = opt.filter ? opt.filter.join(',') : '*',
            limit = opt.limit ? `LIMIT ${opt.limit}` : '',
            where = opt.where ? `WHERE ${opt.where}` : '',
            group = opt.group ? `GROUP BY ${opt.group}`: '',
            order = opt.order ? `ORDER BY ${opt.order}`: '';
        return `
            SELECT 
            ${filter} 
            FROM 
            ${this.table} 
            ${where}
            ${group}
            ${order}            
            ${limit}
        `
    }

    getInsertQuery(data){
        this.body = Object.values(data);
        let keys = "(`" + Object.keys(data).join("`,`") + "`)",
            values = "(" + Array(this.body.length).fill('?').join(",") + ")";
        return `
             INSERT INTO
             ${this.table}
             ${keys} VALUES ${values}
        `
    }

    getMultipleInsertQuery(data){
        this.body = data.flatMap(row => Object.values(row));
        let keys = "(`" + Object.keys(data[0]).join("`,`") + "`)";
        let values = data.map(row => "(" + Array(Object.keys(row).length).fill('?').join(",") + ")").join(",\n");
        return `
             INSERT INTO
             ${this.table}
             ${keys}
             VALUES
             ${values}
        `;
    }

    getUpdateQuery(data,options = {}){
        options.where = options.where || this.where;
        if(!options.where ) throw('no WHERE option in update request');
        this.body = Object.values(data);
        let keys = Object.keys(data).map(key => `${key} = ?`).join(','),
            where = options.where ? `WHERE ${options.where}` : '',
            limit = options.limit ? `LIMIT ${options.limit}` : '';
        return `
             UPDATE
             ${this.table}
             SET
             ${keys}              
             ${where}            
             ${limit}
        `
    }

    getDeleteQuery(options = {}){
        options.where = options.where || this.where;
        if(!options.where ) throw('no WHERE option in delete request');
        this.body = [];
        let where = options.where ? `WHERE ${options.where}` : '';
        return `
             DELETE FROM
             ${this.table}
             ${where}
        `
    }

};