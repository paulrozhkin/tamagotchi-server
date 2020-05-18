const BaseRepository = require('./BaseRepository')
const InvalidArgumentException = require('../../models/Exceptions/InvalidArgumentException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const format = require('pg-format');
const TableModel = require('../../models/TableModel')


class TablesRepository extends BaseRepository {

    async getAll(restaurantId) {
        const result = await this._client.query(`SELECT * FROM ${this._table}
            WHERE restaurant = ${restaurantId};`)

        const tables = []
        result.rows.forEach(row => {
            tables.push(this._getTableFromRow(row))
        })

        return tables
    }

    async add(table) {
        const query = format(`INSERT INTO ${this._table} (name, restaurant, number_of_places) VALUES (%L) RETURNING  *`,
            Object.values(table));

        const result = await this._client.query(query)
        return this._getTableFromRow(result.rows[0])
    }

    async update(restaurantId, tableId, tableUpdateInfo) {
        const dishCurrent = await this.getById(restaurantId, tableId)

        const {photos, ...tableWithoutArray} = tableUpdateInfo

        const query = format(`UPDATE ${this._table} SET (name, number_of_places, description, is_deleted, photos) 
            = (%L, '{${format.string(photos)}}') WHERE id = ${tableId}`,
            Object.values(tableWithoutArray));

        await this._client.query(query)

        return await this.getById(restaurantId, tableId)
    }

    async getById(restaurantId, tableId) {
        let result = await this._client.query(`SELECT * FROM ${this._table}
            WHERE id = '${tableId}' and restaurant = '${restaurantId}';`)
        if (result.rowCount > 0) {
            return this._getTableFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getTableFromRow(row) {
        return new TableModel(row.id, row.name, row.description, row.restaurant,
            row.photos, row.number_of_places, row.is_deleted)
    }
}

module.exports = TablesRepository
