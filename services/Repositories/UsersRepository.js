const BaseRepository = require('./BaseRepository')
const UserModel = require('../../models/UserModel')
const UserModelWithPassword = require('../../models/UserModelWithPassword')
const AlreadyExistException = require('../../models/Exceptions/AlreadyExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const format = require('pg-format');

class UsersRepository extends BaseRepository {

    async getAll() {
        const arrayUsers = []

        const res = await this._client.query(`SELECT id, login, role, avatar, is_blocked, full_name FROM ${this._table};`)

        res.rows.forEach(UserItem => {
            const User = new UserModel(UserItem.id, UserItem.login,
                UserItem.role, UserItem.avatar, UserItem.full_name, UserItem.is_blocked)

            arrayUsers.push(User)
        })

        return arrayUsers
    }

    async update(id, updateInfo) {
        if (!(await this.getById(id))) {
            throw new NotFoundException()
        }

        const query = format(`UPDATE ${this._table} SET (login, role, password, avatar, full_name, is_blocked)
         = (%L) WHERE id = ${id}`, Object.values(updateInfo));

        await this._client.query(query)
        return await this.getById(id)
    }

    async add(login, password) {
        // Check arguments
        if (!(login && password))
            throw new Error("Argument exception. No login or password.")

        await this.checkExistUser(login)

        // Create User
        const sqlQuery = `INSERT INTO ${this._table} (login, password) VALUES ('${login}',
         '${password}') RETURNING id, login, full_name, role, avatar, is_blocked`

        const result = await this._client.query(sqlQuery)
        const row = result.rows[0]
        return new UserModel(row.id, row.login, row.role, row.avatar, row.full_name, row.is_blocked)
    }

    async getUserWithPasswordByLogin(login) {
        let getUserResult = await this._client.query(`SELECT * FROM ${this._table} WHERE login = '${login}';`)

        if (getUserResult.rowCount === 0) {
            throw new NotFoundException()
        }

        let User = getUserResult.rows[0]

        return new UserModelWithPassword(User.id, User.login,
            User.password, User.role,
            User.avatar, User.full_name,
            User.is_blocked)
    }

    async getById(id) {
        let getUserResult = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`)
        if (getUserResult.rowCount === 0) {
            throw new NotFoundException()
        }

        let user = getUserResult.rows[0]
        return new UserModel(user.id, user.login, user.role, user.avatar, user.full_name, user.is_blocked)
    }

    async checkExistUser(login) {
        let newUserResult = await this._client.query(`SELECT COUNT(*) FROM ${this._table} WHERE login = '${login}';`)
        let count = parseInt(newUserResult.rows[0].count)

        if (count !== 0) {
            throw new AlreadyExistException()
        }
    }
}

module.exports = UsersRepository
