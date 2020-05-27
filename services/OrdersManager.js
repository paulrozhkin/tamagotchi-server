const {FilterModel, FilterItemModel} = require('../models/FilterModel')
const OrderStatus = require('../models/OrderStatus')
const OrderStaffStatus = require('../models/OrderStaffStatus')
const OrderUpdatableInfoModel = require('../models/OrderUpdatableInfoModel')

/**
 * Класс для манипулирования заказами, которые находятся в активном состоянии.
 */
class OrdersManager {
    constructor(ordersRepository, scoresRepository) {
        this._ordersRepository = ordersRepository
        this._scoresRepository = scoresRepository
        this.isStarted = false
        this._intervalManagment = 1000
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
        } finally {
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
        const currentTime = new Date()

        if (orders.length !== 0) {
            console.log(`_paymentManagement (current time: ${currentTime.toISOString()}): ${JSON.stringify(orders)}`)
        }

        for (const order of orders) {
            // Заглушка. Спустя 30 секунд после создания считает заказ оплаченным.
            const timeStamp = (currentTime - order.timeCreated)/ 1000.0

            if (timeStamp > 30) {
                await this._ordersRepository.update(order.id, new OrderUpdatableInfoModel(OrderStatus.Confirmed))
                console.log(`_paymentManagement: ${order.id} - ${OrderStatus.Confirmed}`)
            }
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
        filter.addFilterItem(new FilterItemModel(
            "visit_time",
            `tsrange('2000-01-01T00:00:00Z'::timestamp, '${filterTime.toISOString()}'::timestamp)`,
            "&&",
            false
        ))

        const orders = await this._ordersRepository.getAll(filter)

        for (const order of orders) {
            // Если повороам ничего не надо готовить, то обновлять их не надо.
            let newCooksStatus = null
            if (order.orderCooksStatus !== OrderStaffStatus.Ready) {
                newCooksStatus = OrderStaffStatus.Notifying
            }

            await this._ordersRepository.update(order.id, new OrderUpdatableInfoModel(
                OrderStatus.Preparing, newCooksStatus, OrderStaffStatus.Notifying))
        }
    }

}

module.exports = OrdersManager
