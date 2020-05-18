const TableCreateModel = require('./TableCreateModel')

class TableUpdatableModel {
    constructor(name, description, photos, numberOfPlaces, isDeleted) {
        this.name = name
        this.numberOfPlaces = numberOfPlaces
        this.description = description
        this.photos = photos
        this.isDeleted = isDeleted
    }
}

module.exports = TableUpdatableModel
