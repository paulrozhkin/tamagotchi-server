/**
 * Исключение на отсуствие мест в ресторане.
 * @param customMessage
 * @constructor
 */
function NoPlaceException(customMessage) {
    this.message = customMessage ? customMessage : "No place in restaurant."
    this.toString = function () {
        return this.message
    }
}

module.exports = NoPlaceException
