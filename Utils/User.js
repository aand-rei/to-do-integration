const Model = require("./../models/Model");
const crypto = require("crypto");

module.exports = class User {

    constructor(req) {

    }

    async addTask(req){
        let DB = new Model('MySQL',{table : 'tasks'}),
        id, task = req.body;

        try{
            id = await DB.push(task);
        }catch (e){
            return e;
        }

        DB.end();

        return {
            id,
            ...task,
            editedByAdmin: false,
            completed: false
        }
    }

    async login(req){
        let DB = new Model('MySQL',{table : "users"}),
            { username, password } = req.body,
            passInHex = crypto.createHash('md5').update(username + "_" + password).digest("hex"),
            userData;

        try{
            userData = await DB.setWhere({name : username, password : passInHex}).exists();
            if(userData){
                userData = await this.updateTempToken(userData);
            }
        }catch (e){
            return e;
        }

        DB.end();

        return userData;
    }

    async updateTempToken(userData){
        let DB = new Model('MySQL',{table : "users"}),
            server_timestamp = Date.now(),
            temp_token = crypto.createHash('md5').update(server_timestamp + "_temp_token" ).digest("hex");

        await DB.setWhere({id: userData.id}).update({temp_token});
        userData.temp_token = temp_token;
        DB.end();
        return temp_token;
    }

    async getTasks(req){
        let DB = new Model('MySQL',{table : 'tasks'}),
            result,count;
        const { page = 1, sort_field = 'id', sort_direction = 'asc' } = req.query;
        const limit = 3;
        const offset = (page - 1) * limit;
        const order = `${sort_field} ${sort_direction.toUpperCase()}`;

        let selectQuery = `SELECT id,name,email,text,editedByAdmin,completed,
                       (SELECT COUNT(*) FROM tasks) as count
                       FROM tasks
                       ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`;

        try{
            result = await DB.query(selectQuery);
            count = result && result[0]?.count || 0;
            if(count) result = result.map(el => {
                delete(el.count)
                return el;
            });
        }catch (e){
            return e;
        }

        DB.end();

        return {
            tasks: result,
            total_task_count: count,
            page,
            sort_field,
            sort_direction
        }

    };
}