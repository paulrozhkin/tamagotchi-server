class OrderUpdatableInfoModel {
    constructor(orderStatus, orderCooksStatus, orderWaitersStatus, cooks, waiters) {
        this.orderStatus = orderStatus
        this.orderCooksStatus = orderCooksStatus
        this.orderWaitersStatus = orderWaitersStatus
        this.cooks = cooks
        this.waiters = waiters
    }

}

module.exports = OrderUpdatableInfoModel
