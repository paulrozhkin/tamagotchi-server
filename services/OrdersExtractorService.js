const ROLES = require("../models/roles");

/**
 * Сервис для формирования полной сущности заказа, который используется в API.
 */
class OrdersExtractorService {
    constructor(performersRepository, scoresRepository, usersRepository) {
        this.performersRepository = performersRepository
        this.scoresRepository = scoresRepository
        this.usersRepository = usersRepository
    }

    async getFullOrderInfo(orderModel) {

        // Fix visit time for API. Format to RFC 3339.
        orderModel.visitTime = orderModel.visitTime.split(',')[0].replace('(', '')
            .replace(/"/g, '').replace(' ', 'T')
        orderModel.visitTime = orderModel.visitTime + 'Z'


        const {score, ...orderModelWithoutScore} = orderModel

        const totalAmount = null
        const orderWithAmount = {...orderModelWithoutScore, ...totalAmount}
        if (orderModel.score) {
            const scoreFullInfo = await this.scoresRepository.getById(orderModel.score)
            orderWithAmount.totalAmount = scoreFullInfo.paymentAmount
        }

        const performerFilter = {
            order_id: orderModel.id
        }

        const performers = await this.performersRepository.getAll(performerFilter)
        const fullInfoPerformer = []
        for (const performer of performers) {
            const userInfo = await this.usersRepository.getById(performer.performerId)
            fullInfoPerformer.push(userInfo)
        }

        const cooksFull = fullInfoPerformer.filter(user => user.role === ROLES.Cook)
        const cooks = []
        cooksFull.forEach(fullInfoUser => cooks.push(fullInfoUser.id))

        const waitersFull = fullInfoPerformer.filter(user => user.role === ROLES.Waiter)
        const waiters = []
        waitersFull.forEach(fullInfoUser => waiters.push(fullInfoUser.id))

        return {
            ...orderWithAmount,
            cooks,
            waiters
        }
    }
}

module.exports = OrdersExtractorService
