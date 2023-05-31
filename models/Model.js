module.exports = class Model {

    constructor(name,options) {
        let {config} = new require(`./config/${name}.config`),
            instance = require(`./instance/${name}`);
        this.instance = new instance(config,options);
    }

    push(data){
        if(data) return this.instance.push(data);
    }

    pushArray(data){
        if(data) return this.instance.pushArray(data);
    }

    update(data,options){
        if(data) return this.instance.update(data,options);
    }

    get(options){
        return this.instance.get(options);
    }

    query(str){
        return this.instance.query(str);
    }

    exists(options){
        return this.instance.exists(options);
    }

    end(){
        this.instance.end();
    }

    setWhere(obj,delimiter = 'AND'){
        return this.instance.setWhere(obj,delimiter = 'AND');
    }

    setTable(name){
        return this.instance.setTable(name);
    }


};