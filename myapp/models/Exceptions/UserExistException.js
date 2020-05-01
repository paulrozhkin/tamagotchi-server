function UserExistException() {
    this.message = "User already exist";
    this.toString = function() {
        return this.message
    };
}

module.exports = UserExistException;
