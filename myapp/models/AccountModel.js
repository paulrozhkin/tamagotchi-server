class AccountModel {

    constructor(id, login, password, role, fullName, isBlocked) {
        this.id = id;
        this.login = login;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.isBlocked = isBlocked;
    }
}

module.exports = AccountModel;