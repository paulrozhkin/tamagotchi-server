function AccountExistException() {
    this.message = "Account already exist";
    this.toString = function() {
        return this.message
    };
}

module.exports = AccountExistException;