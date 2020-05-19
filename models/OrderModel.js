class OrderModel {
    constructor(id, restaurant, client, menu, reservedTable, comment, score, visitTime, status, cooksStatus, waitersStatus) {
        this.id = id;
        this.restaurant = restaurant;
        this.client = client;
        this.menu = menu;
        this.reservedTable = reservedTable;
        this.comment = comment;
        this.score = score;
        this.visitTime = visitTime;
        this.orderStatus = status;
        this.orderCooksStatus = cooksStatus;
        this.orderWaitersStatus = waitersStatus;
    }
}

module.exports = OrderModel
