const BaseRepository = require('./BaseRepository')
const AlreadyExistException = require('../../models/Exceptions/AlreadyExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const PerformerModel = require('../../models/PerformerModel')
const FilterToWhereService = require('../FilterToWhereService')

class PerformersRepository extends BaseRepository {

    async getAll(filter) {
        const result = await this._client.query(`SELECT * FROM ${this._table} ${FilterToWhereService.convertFilterToWhere(filter)};`)

        const performers = []
        result.rows.forEach(row => {
            performers.push(this._getOrderPerformerFromRow(row))
        })

        return performers
    }

    async add(performer) {
        const query = `
        INSERT INTO ${this._table} (performer_id, start_time, order_id)
         VALUES ('${performer.performerId}', '${Date.now()}', ${performer.orderId}) 
         RETURNING  *`

        const result = await this._client.query(query)
        return this._getOrderPerformerFromRow(result.rows[0])
    }

    async getById(id) {
        let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`)
        if (result.rowCount > 0) {
            return this._getOrderPerformerFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getOrderPerformerFromRow(row) {
        return new PerformerModel(row.id, row.performer_id, row.start_time, row.end_time, row.order_id)
    }
}

module.exports = PerformersRepository
