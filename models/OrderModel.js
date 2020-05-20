class OrderModel {
    constructor(id, restaurant, client, numberOfPersons, menu, reservedTable, comment, score, visitTime, status, cooksStatus, waitersStatus, timeCreated) {
        this.id = id;
        this.restaurant = restaurant;
        this.numberOfPersons = numberOfPersons
        this.client = client;
        this.menu = menu;
        this.reservedTable = reservedTable;
        this.comment = comment;
        this.score = score;
        this.visitTime = visitTime;
        this.orderStatus = status;
        this.orderCooksStatus = cooksStatus;
        this.orderWaitersStatus = waitersStatus;
        // Костыль, адаптер считает, что в БД лежит смещение +3 часа.
        this.timeCreated = new Date(new Date(timeCreated).setHours(timeCreated.getHours() + 3))
    }
}

module.exports = OrderModel
