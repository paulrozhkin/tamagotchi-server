const AccountModel = require("./AccountModel")

class AccountModelWithPassword extends AccountModel{
    constructor(id, login, password, role, avatar, fullName, isBlocked) {
        super(id, login, role, avatar, fullName, isBlocked);
        this.password = password
    }
}

module.exports = AccountModelWithPassword
