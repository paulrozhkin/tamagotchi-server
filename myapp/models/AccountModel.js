class AccountModel {

    constructor(id, login, password, role, fullName, isBlocked) {
        this._id = id;
        this._login = login;
        this._password = password;
        this._role = role;
        this._fullName = fullName;
        this._isBlocked = isBlocked;
    }

    get id() {
        return this._id;
    }

    get login() {
        return this._login;
    }

    get password() {
        return this._password;
    }

    get role() {
        return this._role;
    }

    get fullName() {
        return this._fullName;
    }

    get isBlocked() {
        return this._isBlocked;
    }
}

module.exports = AccountModel;