const BaseRepository = require('./BaseRepository');
const UserModel = require('../../models/UserModel');
const UserModelWithPassword = require('../../models/UserModelWithPassword');
const UserExistException = require('../../models/Exceptions/UserExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')

class UsersRepository extends BaseRepository {

    _table = "public.users"

    async getAllUsers() {
        /*const arrayUsers = [];

        const res = await this._client.query(`SELECT * FROM ${this._table};`);

        res.rows.forEach(UserItem => {
            const User = new UserModel(UserItem.id, UserItem.login,
                UserItem.password, UserItem.role,
                UserItem.full_name, UserItem.is_blocked);

            arrayUsers.push(User);
        });

        return arrayUsers;*/
    }

    async createNewUsers(newUser) {
        // Check arguments
        /*if (!(newUser.login && newUser.password))
            throw new Error("Argument exception. No login or password.");

        await this.checkExistUser(newUser.login);

        // Create User
        const sqlQuery = `INSERT INTO ${this._table} (login, password) VALUES ('${newUser.login}',
         '${newUser.password}')`;

        await this._client.query(sqlQuery);
        return await this.getUserByLogin(newUser.login);
        */
    }

    async getUserWithPasswordByLogin(login) {
        let getUserResult = await this._client.query(`SELECT * FROM ${this._table} WHERE login = '${login}';`);

        if (getUserResult.rowCount === 0) {
            throw new NotFoundException()
        }

        let User = getUserResult.rows[0];

        return new UserModelWithPassword(User.id, User.login,
            User.password, User.role,
            User.avatar, User.full_name,
            User.is_blocked);
    }

    async getUser(id) {
        /*let getUserResult = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`);
        if (getUserResult.rowCount === 1) {
            let User = getUserResult.rows[0];
            return new UserModel(User.id, User.login, User.password, User.role, User.avatar, User.full_name, User.is_blocked);
        } else {
            return null;
        }*/
    }

    async checkExistUser(login) {
        let newUserResult = await this._client.query(`SELECT COUNT(*) FROM ${this._table} WHERE login = '${login}';`);
        let count = parseInt(newUserResult.rows[0].count);

        if (count !== 0) {
            throw new UserExistException();
        }
    }
}

module.exports = UsersRepository;
