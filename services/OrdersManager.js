const {FilterModel, FilterItemModel} = require('../models/FilterModel')
const OrderStatus = require('../models/OrderStatus')

/**
 * Класс для манипулирования заказами, которые находятся в активном состоянии.
 */
class OrdersManager {
    constructor(ordersRepository, scoresRepository) {
        this._ordersRepository = ordersRepository
        this._scoresRepository = scoresRepository
        this.isStarted = false
        this._intervalManagment  = 1000
        this._isManagmentCallbackExecute = false
        this._managerTimer = null
    }

    start() {
        if (this.isStarted) {
            throw new Error("Already started")
        }

        //this._managementCallback.bind(this)
        setInterval(this._managementCallback.bind(this), this._intervalManagment)
    }

    stop() {

    }

    async _managementCallback() {
        // Если выполняется, то пропускаем цикл. Такого происходить в теории не должно. Только если очень много
        //  запросов нужно было отработать в цикле.
        if (this._isManagmentCallbackExecute) {
            return
        }

        this._isManagmentCallbackExecute = true

        try {
            await this._paymentManagement()
            await this._staffAlertsManagement()
        } catch (e) {
            console.log(e)
        }
        finally {
            this._isManagmentCallbackExecute = false
        }
    }

    /**
     * Управление заказами, которые находятся в состоии "PaymentMadeing".
     * Происходит запрос по токену и проверка текущего состояния оплаты от яндекс кассы.
     * @return {Promise<void>}
     * @private
     */
    async _paymentManagement() {
        const filter = new FilterModel()
        filter.addFilterItem(new FilterItemModel('status', OrderStatus.PaymentMadeing))

        const orders = await this._ordersRepository.getAll(filter)

        for (const order of orders) {
            // Заглушка. Спустя 30 секунд после создания считает заказ оплаченным.
            // TODO: обновление
        }
    }

    /**
     * Управление заказми, которые ожидают начало подготовки. За час до прихода посетителя персонал оповещается о
     * необходимости подготовить столик и блюда. Как только персонал выполнил все функции,
     * то заказ считается подготовленным.
     * @return {Promise<void>}
     * @private
     */
    async _staffAlertsManagement() {
        // Прибавляем один час к текущему времени (время для начала оповещения персонала о начале заказа)
        const currentTime = new Date()
        const filterTime = new Date(new Date(currentTime).setHours(currentTime.getHours() + 1))

        const filter = new FilterModel()
        filter.addFilterItem(new FilterItemModel('status', OrderStatus.Confirmed))
        filter.addFilterItem(
            new FilterItemModel(
                `'${filterTime.toISOString()}'::timestamp`,
                'visit_time',
                '<@',
                false))

        const orders = await this._ordersRepository.getAll(filter)

        for (const order of orders) {
            // TODO: обновление состояний
        }
    }

}

module.exports = OrdersManager
