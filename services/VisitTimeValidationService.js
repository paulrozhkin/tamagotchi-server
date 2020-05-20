const {FilterModel, FilterItemModel} = require('../models/FilterModel')
const OrderStatus = require('../models/OrderStatus')

/**
 * Сервис валидации времени визита посетителей.
 */
class VisitTimeValidationService {
    constructor(ordersRepository, tablesRepository) {
        this._tablesRepository = tablesRepository
        this._ordersRepository = ordersRepository
    }

    /**
     * Возвращает свободные столики рестарана в выбранное время.
     * @param restaurantId id ресторана
     * @param timeStart начало интервала.
     * @param timeEnd конец интервала.
     * @return {Promise<void>} Свободные столики в ресторане в выбранный интервал.
     */
    async getFreeTables(restaurantId, timeStart, timeEnd) {
        // Получаем все заказы, которые будут происходить в тот же момент, что и проверяемый.
        const filter = new FilterModel()
        const filterItemTime = new FilterItemModel(
            "visit_time",
            `tsrange('${timeStart.toISOString()}'::timestamp, '${timeEnd.toISOString()}'::timestamp)`,
            "&&",
            false
        )
        filter.addFilterItem(filterItemTime)
        filter.addFilterItem(new FilterItemModel('restaurant', restaurantId))
        filter.addFilterItem(new FilterItemModel('status', OrderStatus.NoPlace, '!='))
        filter.addFilterItem(new FilterItemModel('status', OrderStatus.PaymentError, '!='))

        const overlappingOrders = await this._ordersRepository.getAll(filter)
        let busyTablesId = []
        overlappingOrders.forEach(order => {
            if (order.reservedTable != null) {
                busyTablesId = busyTablesId.concat(busyTablesId, order.reservedTable)
            }
        })

        const allTables = await this._tablesRepository.getAll(restaurantId)
        return allTables.filter(table => !busyTablesId.includes(table.id))
    }
}

module.exports = VisitTimeValidationService
