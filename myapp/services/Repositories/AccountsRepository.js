const BaseRepository = require('./BaseRepository');
const AccountModel = require('../../models/AccountModel');
const AccountModelWithPassword = require('../../models/AccountModelWithPassword');
const AccountExistException = require('../../models/Exceptions/AccountExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')

class AccountsRepository extends BaseRepository {

    _table = "public.users"

    async getAllAccounts() {
        /*const arrayAccounts = [];

        const res = await this._client.query(`SELECT * FROM ${this._table};`);

        res.rows.forEach(accountItem => {
            const account = new AccountModel(accountItem.id, accountItem.login,
                accountItem.password, accountItem.role,
                accountItem.full_name, accountItem.is_blocked);

            arrayAccounts.push(account);
        });

        return arrayAccounts;*/
    }

    async createNewAccounts(newAccount) {
        // Check arguments
        /*if (!(newAccount.login && newAccount.password))
            throw new Error("Argument exception. No login or password.");

        await this.checkExistAccount(newAccount.login);

        // Create account
        const sqlQuery = `INSERT INTO ${this._table} (login, password) VALUES ('${newAccount.login}',
         '${newAccount.password}')`;

        await this._client.query(sqlQuery);
        return await this.getAccountByLogin(newAccount.login);
        */
    }

    async getAccountWithPasswordByLogin(login) {
        let getAccountResult = await this._client.query(`SELECT * FROM ${this._table} WHERE login = '${login}';`);

        if (getAccountResult.rowCount === 0) {
            throw new NotFoundException()
        }

        let account = getAccountResult.rows[0];

        return new AccountModelWithPassword(account.id, account.login,
            account.password, account.role,
            account.avatar, account.full_name,
            account.is_blocked);
    }

    async getAccount(id) {
        /*let getAccountResult = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`);
        if (getAccountResult.rowCount === 1) {
            let account = getAccountResult.rows[0];
            return new AccountModel(account.id, account.login, account.password, account.role, account.avatar, account.full_name, account.is_blocked);
        } else {
            return null;
        }*/
    }

    async checkExistAccount(login) {
        let newAccountResult = await this._client.query(`SELECT COUNT(*) FROM ${this._table} WHERE login = '${login}';`);
        let count = parseInt(newAccountResult.rows[0].count);

        if (count !== 0) {
            throw new AccountExistException();
        }
    }
}

module.exports = AccountsRepository;
