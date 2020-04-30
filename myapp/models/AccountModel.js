class AccountModel {
    constructor(id, login, role, avatar, fullName, isBlocked) {
        this.id = id;
        this.login = login;
        this.role = role;
        this.avatar = avatar
        this.fullName = fullName;
        this.isBlocked = isBlocked;
    }
}

module.exports = AccountModel;
