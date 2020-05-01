function NotFoundException() {
    this.message = "Not found in system."
    this.toString = function () {
        return this.message
    }
}

module.exports = NotFoundException
