/**
 * Исключение времени посещения.
 * @param customMessage
 * @constructor
 */
function IncorrectOrderParametersException(customMessage) {
    this.message = customMessage ? customMessage : "Error visit time."
    this.toString = function () {
        return this.message
    }
}

module.exports = IncorrectOrderParametersException
