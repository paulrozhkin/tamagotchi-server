class FilterToWhereService {
    /**
     * Выполняет конвертацию объекта (фильтра) в конструкцию WHERE с AND.
     * @param filter js объект, свойства которого должны совпадать с полями БД.
     * @return {string} конструкция WHERE.
     */
    static convertFilterToWhere(filter) {
        if (!filter) {
            return ''
        }

        const keys = Object.keys(filter).filter(key => filter[key] !== undefined)
        if (keys.length === 0) {
            return ''
        }

        let result = 'WHERE '
        keys.forEach((key, index, arr) => {
            if (Object.is(arr.length - 1, index)) {
                result = result + `${key} = '${filter[key]}'`
            } else {
                result = result + `${key} = '${filter[key]}' AND`
            }
        })

        return result
    }
}

module.exports = FilterToWhereService
