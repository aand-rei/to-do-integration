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

    async login(req) {
        let DB = new Model('MySQL', { table: "users" }),
            { username, password } = req.body,
            passInHex = crypto.createHash('md5').update(username + "_" + password).digest("hex"),
            userData, temp_token;
        try {
            userData = await DB.setWhere({ name: username, password: passInHex }).exists();
            if (userData) {
                temp_token = await this.updateTempToken(userData);
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
        DB.end();
        return temp_token;
    }

    async updateTempToken(userData) {
        let DB = new Model('MySQL', { table: "users" }),
            server_timestamp = Date.now(),
            temp_token = crypto.createHash('md5').update(server_timestamp + "_temp_token").digest("hex");
        try {
            let updatedRow = await DB.setWhere({ id: userData.id }).update({ temp_token });
            return updatedRow ? temp_token : null;
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
            DB.end();
        }
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
            tasks: result || [],
            total_task_count: count,
            page,
            sort_field,
            sort_direction
        }

    };
}