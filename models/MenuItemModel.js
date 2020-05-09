const MenuItemInfoModel = require('./MenuItemInfoModel')

class MenuItemModel extends MenuItemInfoModel {
    constructor(id, dish, price, isDeleted) {
        super(dish, price, isDeleted)
        this.id = id
    }
}

module.exports = MenuItemModel
