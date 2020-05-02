function RestaurantPropertiesException() {
    this.message = "Restaurant properties not set."
    this.toString = function () {
        return this.message
    }
}

module.exports = RestaurantPropertiesException
