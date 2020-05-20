class FilterModel {
    constructor() {
        this._filtres = []
    }

    /**
     * Проверка наличия фильтрации.
     * @return {boolean} true - элементы фильра отсуствуют.
     */
    isEmpty() {
        return this._filtres.length === 0
    }

    /**
     * Добавить новый элемент фильтра в общий фильтр.
     * @param filterItem новый элемент фильтра.
     * @return {boolean} True - элемент был добавлен.
     */
    addFilterItem(filterItem) {
        if (!(filterItem instanceof FilterItemModel)) {
            throw new Error(`${filterItem} not a filter`)
        }

        if (filterItem.key && filterItem.value && filterItem.operation) {
            this._filtres.push(filterItem)
            return true
        }

        return false
    }

    /**
     * Выполняет конвертацию фильтра в конструкцию WHERE с AND.
     * @return {string} конструкция WHERE.
     */
    convertFilterToWhere() {
        if (this.isEmpty()) {
            return ''
        }

        let result = 'WHERE '
        this._filtres.forEach((filter, index, arr) => {
            result += filter.toString()

            if (arr.length - 1 !== index) {
                result += ' AND '
            }
        })

        return result
    }
}

class FilterItemModel {
    isShieldingRequired = true;
    /**
     * Создание элемента фильтра.
     * @param key Название стобца БД, по которому проводится фильтрация.
     * @param value Значение столбца.
     * @param operation Операция для where (WHERE ${key} ${operation} ${value}).
     * @param isShieldingRequired требуется экранинирование фильтра с помощью "'" в toString.
     */
    constructor(key, value, operation = '=', isShieldingRequired = true) {
        this.isShieldingRequired = isShieldingRequired;
        this.key = key
        this.operation = operation
        this.value = value
    }

    toString() {
        if (this.isShieldingRequired) {
            return `${this.key} ${this.operation} '${this.value}'`
        } else {
            return `${this.key} ${this.operation} ${this.value}`
        }
    }
}

module.exports = {FilterModel, FilterItemModel}
