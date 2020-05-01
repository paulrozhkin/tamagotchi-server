function RestaurantExistException() {
    this.message = "Restaurant already exist"
    this.toString = function () {
        return this.message
    }
}

module.exports = RestaurantExistException
