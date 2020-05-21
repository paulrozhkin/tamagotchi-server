const BaseRepository = require('./BaseRepository')
const format = require('pg-format');

class FeedbackRepository extends BaseRepository {

    async getAll() {
        const result = await this._client.query(`SELECT * FROM ${this._table}`)

        const feedback = []
        result.rows.forEach(row => {
            feedback.push(this._getFeedbackFromRow(row))
        })

        return feedback
    }

    async add(feedback) {
        const query = format(`INSERT INTO ${this._table} (feedback, created_time, user_id) 
            VALUES (%L, %L, %s) RETURNING  *`,
            feedback.feedback, feedback.createdTime, feedback.user);

        const result = await this._client.query(query)
        return this._getFeedbackFromRow(result.rows[0])
    }

    _getFeedbackFromRow(row) {
        let createdTime = row.created_time
        createdTime = new Date(new Date(createdTime).setHours(createdTime.getHours() + 3))

        return {
            id: row.id,
            user: row.user_id,
            feedback: row.feedback,
            createdTime: createdTime
        }
    }
}

module.exports = FeedbackRepository
