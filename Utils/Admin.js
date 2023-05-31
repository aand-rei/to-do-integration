const Model = require("./../models/Model");

module.exports = class Admin {

    static async initUserMiddleware(req, res, next){
        let DB = new Model('MySQL',{table : 'users'}),
            temp_token = req.query.temp_token;

        let user = await DB.setWhere({temp_token}).exists();

        DB.end();

        if(user){
            next();
        }else {
            res.status(403).send({status: 2, error: 'Wrong token'});
        }
    }

    async updateTask(req){
        let DB = new Model('MySQL',{table : 'tasks'}),
            id = req.params,
            task = req.body,
            updatedTask;

        try{
            await DB.setWhere(id).update(task);
            updatedTask = await DB.get();
        }catch (e){
            return e;
        }
        DB.end();

        return updatedTask[0];
    }



};