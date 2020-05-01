const UserModel = require("./UserModel")

class UserModelWithPassword extends UserModel{
    constructor(id, login, password, role, avatar, fullName, isBlocked) {
        super(id, login, role, avatar, fullName, isBlocked);
        this.password = password
    }
}

module.exports = UserModelWithPassword
