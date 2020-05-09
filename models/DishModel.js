const DishInfoModel = require('./DishInfoModel')

class DishModel extends DishInfoModel {
    constructor(id, name, description, photos) {
        super(name, description, photos)
        this.id = id
    }
}

module.exports = DishModel
