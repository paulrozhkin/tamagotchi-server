class OrderCreateModel {
    constructor(restaurant, client, numberOfPersons, menu, visitTimeString, comment, paymentToken) {
        this.restaurant = restaurant;
        this.client = client;
        this.numberOfPersons = numberOfPersons
        this.menu = menu;
        this.visitTime = new Date(visitTimeString);
        if (isNaN(this.visitTime)) {
            throw new Error("Invalid visit time property.")
        }

        this.comment = comment;
        this.paymentToken = paymentToken;
    }
}

module.exports = OrderCreateModel
