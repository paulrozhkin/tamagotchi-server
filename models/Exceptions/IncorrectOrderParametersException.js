/**
 * Исключение времени посещения.
 * @param customMessage
 * @constructor
 */
function IncorrectOrderParametersException(customMessage) {
    this.message = customMessage ? customMessage : "Error order properties."
    this.toString = function () {
        return this.message
    }
}

module.exports = IncorrectOrderParametersException
