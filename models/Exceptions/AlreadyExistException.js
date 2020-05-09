function AlreadyExistException() {
    this.message = "Restaurant already exist"
    this.toString = function () {
        return this.message
    }
}

module.exports = AlreadyExistException
