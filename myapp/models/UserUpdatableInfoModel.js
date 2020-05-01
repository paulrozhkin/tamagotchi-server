class UserUpdatableInfoModel {
    constructor(currentUser, login, role, password, avatar, fullName, isBlocked) {
        this.login = login && login !== "" ? login : currentUser.login
        this.role = role ? role : currentUser.role
        this.password = password ? password : null
        this.avatar = avatar ? avatar : currentUser.avatar
        this.fullName = fullName ? fullName : currentUser.fullName
        this.isBlocked = isBlocked ? isBlocked : currentUser.isBlocked
    }
}

module.exports = UserUpdatableInfoModel
