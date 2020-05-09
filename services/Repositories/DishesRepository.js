const BaseRepository = require('./BaseRepository')
const InvalidArgumentException = require('../../models/Exceptions/InvalidArgumentException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const format = require('pg-format');
const DishModel = require('../../models/DishModel')


class DishesRepository extends BaseRepository {

    async getAll() {
        const result = await this._client.query(`SELECT * FROM ${this._table};`)

        const dishes = []
        result.rows.forEach(dishRow => {
            dishes.push(this._getDishFromRow(dishRow))
        })

        return dishes
    }

    async add(dish) {
        const {photos, ...dishWithoutArray} = dish

        const query = format(`INSERT INTO ${this._table} (name, description, photos) VALUES (%L, '{${format.string(photos)}}') RETURNING  *`,
            Object.values(dishWithoutArray));

        const result = await this._client.query(query)
        return this._getDishFromRow(result.rows[0])
    }

    async update(id, dish) {
        const dishCurrent = await this.getById(id)

        if (dish.name === undefined) {
            dish.name = dishCurrent.name
        }

        if (dish.description === undefined) {
            dish.description = dishCurrent.description
        }

        if (dish.photos === undefined) {
            dish.photos = dishCurrent.photos
        }

        const {photos, ...dishWithoutArray} = dish

        const query = format(`UPDATE ${this._table} SET (name, description, photos) 
            = (%L, '{${format.string(photos)}}') WHERE id = ${id}`,
            Object.values(dishWithoutArray));

        await this._client.query(query)

        return await this.getById(id)
    }

    async getById(id) {
        let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`)
        if (result.rowCount > 0) {
            return this._getDishFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getDishFromRow(row) {
        return new DishModel(row.id, row.name, row.description, row.photos)
    }
}

module.exports = DishesRepository
