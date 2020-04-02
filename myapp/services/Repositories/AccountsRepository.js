const BaseRepository = require('./BaseRepository');
const AccountModel = require('../../models/AccountModel');
const AccountExistException = require('../../models/Exceptions/AccountExistException')

class AccountsRepository extends BaseRepository {

    async getAllAccounts() {
        const arrayAccounts = [];

        const res = await this._client.query('SELECT * FROM public.accounts;');

        res.rows.forEach(accountItem => {
            const account = new AccountModel(accountItem.id, accountItem.login, accountItem.password, accountItem.role, accountItem.full_name, accountItem.is_blocked);
            arrayAccounts.push(account);
        });

        return arrayAccounts;
    }

    async createNewAccounts(newAccount) {
        // Check arguments
        if (!newAccount.login.trim() && !newAccount.password.trim())
            throw new Error("Argument exception");

        await this.checkExistAccount(newAccount.login);

        // Create account
        const sqlQuery = `INSERT INTO public.accounts (login, password) VALUES ('${newAccount.login}' , '${newAccount.password}')`;
        await this._client.query(sqlQuery);

        return await this.getAccount(newAccount.login);
    }

    async getAccountByLogin(login) {
        let getAccountResult = await this._client.query(`SELECT * FROM public.accounts WHERE login = '${login}';`);

        if (getAccountResult.rowCount === 1) {
            let account = getAccountResult.rows[0];
            return new AccountModel(account.id, account.login, account.password, account.role, account.full_name, account.is_blocked);
        } else {
            return null;
        }
    }

    async getAccount(id) {
        let getAccountResult = await this._client.query(`SELECT * FROM public.accounts WHERE id = '${id}';`);
        if (getAccountResult.rowCount === 1) {
            let account = getAccountResult.rows[0];
            return new AccountModel(account.id, account.login, account.password, account.role, account.full_name, account.is_blocked);
        } else {
            return null;
        }
    }

    async checkExistAccount(login) {
        let newAccountResult = await this._client.query(`SELECT COUNT(*) FROM public.accounts WHERE login = '${login}';`);
        let count = parseInt(newAccountResult.rows[0].count);

        if (count !== 0) {
            throw new AccountExistException();
        }
    }
}

module.exports = AccountsRepository;