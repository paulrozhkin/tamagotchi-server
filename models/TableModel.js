const TableCreateModel = require('./TableCreateModel')

class TableModel extends TableCreateModel{
    constructor(id, name, description, restaurant, photos, numberOfPlaces, isDeleted) {
        super(name, restaurant, numberOfPlaces)
        this.id = id
        this.description = description
        this.photos = photos
        this.isDeleted = isDeleted
    }
}

module.exports = TableModel
