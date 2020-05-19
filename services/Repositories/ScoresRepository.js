const BaseRepository = require('./BaseRepository')
const AlreadyExistException = require('../../models/Exceptions/AlreadyExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const ScoreModel = require('../../models/ScoreModel')

class ScoresRepository extends BaseRepository {

    async getAll() {
        const result = await this._client.query(`SELECT * FROM ${this._table};`)

        const scores = []
        result.rows.forEach(row => {
            scores.push(this._getScoreFromRow(row))
        })

        return scores
    }

    async add(score) {
        const query = `
        INSERT INTO ${this._table} (payment_token, payment_amount)
         VALUES ('${score.paymentToken}', '${score.paymentAmount}') 
         RETURNING  *`

        const result = await this._client.query(query)
        return this._getScoreFromRow(result.rows[0])
    }

    async getById(id) {
        let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`)
        if (result.rowCount > 0) {
            return this._getScoreFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getScoreFromRow(row) {
        return new ScoreModel(row.id, row.payment_token, row.payment_amount)
    }
}

module.exports = ScoresRepository
