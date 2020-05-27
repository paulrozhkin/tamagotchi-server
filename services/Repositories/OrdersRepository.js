const BaseRepository = require('./BaseRepository')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const NoPlaceException = require('../../models/Exceptions/NoPlaceException')
const IncorrectOrderParametersException = require('../../models/Exceptions/IncorrectOrderParametersException')
const format = require('pg-format');
const OrderModel = require('../../models/OrderModel')
const OrdersExtractorService = require('../OrdersExtractorService')
const {FilterModel, FilterItemModel} = require('../../models/FilterModel')
const VisitTimeValidationService = require('../VisitTimeValidationService')
const OrderStatus = require('../../models/OrderStatus')
const OrderStaffStatus = require('../../models/OrderStaffStatus')
const ScoreModel = require('../../models/ScoreModel')
const ROLES = require('../../models/roles')
const PerformerCreateModel = require('../../models/PerformerCreateModel')

class OrdersRepository extends BaseRepository {
    constructor(_client, tableName, restaurantsRepo, menuRepo, tablesRepo, scoresRepo, performersRepo, usersRepo) {
        super(_client, tableName)

        this.restaurantRepo = restaurantsRepo
        this.menuRepo = menuRepo
        this.tablesRepo = tablesRepo
        this.scoresRepo = scoresRepo
        this.performersRepo = performersRepo
        this.usersRepo = usersRepo

        this.ordersExtractorService = new OrdersExtractorService(this.performersRepo, this.scoresRepo, this.usersRepo)
        this.visitTimeValidationService = new VisitTimeValidationService(this, this.tablesRepo)
    }

    async getAll(filter) {
        const query = `SELECT * FROM ${this._table} ${filter.convertFilterToWhere()};`

        const result = await this._client.query(query)

        const orders = []

        for (const row of result.rows) {
            const orderDAO = this._getOrderFromRow(row)
            const fullInfo = await this.ordersExtractorService.getFullOrderInfo(orderDAO)
            orders.push(fullInfo)
        }

        return orders
    }

    async add(order) {
        // Создаем время посещения клиента.
        const visitTimeStart = order.visitTime
        const timeCreated = new Date()
        if (visitTimeStart - timeCreated < 0) {
            throw new IncorrectOrderParametersException("You cannot create a new order with a visit time shorter than the current time.")
        }

        const visitTimeEnd = new Date(new Date(order.visitTime).setHours(visitTimeStart.getHours() + 3))

        // Проверям корректность заказанных блюд, если пользователь что то заказал.
        const menuItems = []
        if (order.menu) {
            for (const menuItemId of order.menu) {
                try {
                    const menuItem = await this.menuRepo.getById(order.restaurant, menuItemId)

                    if (menuItem.isDeleted) {
                        throw new IncorrectOrderParametersException(`Menu ${menuItemId} no longer supplied.`)
                    }

                    menuItems.push(menuItem)
                } catch (e) {
                    if (e instanceof NotFoundException) {
                        throw new IncorrectOrderParametersException(
                            `Menu № ${menuItemId} not contains in restaurant № ${order.restaurant}.`)
                    }

                    throw e
                }
            }
        }

        // Создаем новый заказ.
        const createdFields = {
            restaurant: order.restaurant,
            client: order.client,
            comment: order.comment,
            numberOfPersons: order.numberOfPersons,
            status: OrderStatus.Created,
            visit_time: `('${visitTimeStart.toISOString()}', '${visitTimeEnd.toISOString()}')`,
            time_created: timeCreated.toISOString()
        }

        const query = format(`INSERT INTO ${this._table} (restaurant, client, comment,
         number_of_persons, status, visit_time, time_created)
             VALUES (%L) RETURNING  id`, Object.values(createdFields));
        const resultCreate = await this._client.query(query)
        const newOrderId = resultCreate.rows[0].id

        // Находим свободные столики в ресторане.
        const freeTables = await this.visitTimeValidationService.getFreeTables(order.restaurant, visitTimeStart, visitTimeEnd)

        // Выделяем столики для обслуживания заказа.
        // TODO: на текуйщий момент может быть выделен только один столик.
        const orderTables = []
        const bestTables = freeTables.filter(table => order.numberOfPersons <= table.numberOfPlaces)
        const minPlaceInTable = Math.min(...bestTables.map(item => item.numberOfPlaces))
        const bestTable = bestTables.filter(table => table.numberOfPlaces === minPlaceInTable)[0]
        if (bestTable != null) {
            orderTables.push(bestTable.id)
        }

        // Если столик не был выделен, то свободных мест нету.
        if (orderTables.length === 0) {
            const queryNoPlace = format(`UPDATE ${this._table} SET status
             = %L WHERE id = ${newOrderId}`, OrderStatus.NoPlace)
            await this._client.query(queryNoPlace)
            throw new NoPlaceException()
        }

        // Бронируем столик.
        const queryTimeConfirmed = format(`UPDATE ${this._table} SET reserved_tables
             = '{${format.string(orderTables)}}' WHERE id = ${newOrderId}`)
        await this._client.query(queryTimeConfirmed)

        // Если пользователь заказал что то в меню, то обрабатываем оплату заказа.
        if (menuItems.length !== 0) {

            let amount = menuItems.reduce((menuItemX, menuItemY) => menuItemX.price + menuItemY.price)
            const score = await this.scoresRepo.add(new ScoreModel(null, order.paymentToken, amount))

            // TODO: тут мы отправляем токен в яндекс кассы, чтобы осуществить попку, но пока мы не ИП и у нас нет
            //  реальноного магазина этого сделать нельзя. Тут нужно добавить валидацию меню,
            //  сумма должна сопадать с той, что находится в токене.

            const queryPaymentMade = format(`UPDATE ${this._table} SET (status, score, menu)
             = (%L, %L,'{${format.string(order.menu)}}') WHERE id = ${newOrderId}`,
                OrderStatus.PaymentMadeing, score.id)
            await this._client.query(queryPaymentMade)
        } else {
            // Иначе на этом обработка создания завершена и мы просто ждем клиента в ресторане в назначенное время
            // (после подготовки его столика
            const queryTimeConfirmed = format(`UPDATE ${this._table} SET (status, cooks_status)
             = (%L, %L) WHERE id = ${newOrderId}`, OrderStatus.Confirmed, OrderStaffStatus.Ready)
            await this._client.query(queryTimeConfirmed)
        }

        return this.getById(newOrderId)
    }

    async update(id, orderInfo) {
        const orderCurrent = await this.getById(id)

        if (orderInfo.orderStatus === undefined) {
            orderInfo.orderStatus = orderCurrent.orderStatus
        }

        if (orderInfo.orderCooksStatus === undefined) {
            orderInfo.orderCooksStatus = orderCurrent.orderCooksStatus
        }

        if (orderInfo.orderWaitersStatus === undefined) {
            orderInfo.orderWaitersStatus = orderCurrent.orderWaitersStatus
        }

        try {
            await this._client.query("BEGIN;")

            if (orderInfo.cooks === undefined) {
                orderInfo.cooks = orderCurrent.cooks
            } else {
                // Удалять нельзя.
                const missingCooks = orderCurrent.cooks.filter(cookId => !orderInfo.cooks.includes(cookId))
                if (missingCooks.length !== 0) {
                    throw new IncorrectOrderParametersException(`Cooks ${missingCooks} cannot be removed from the order.`)
                }

                // Определяем новых поворов
                const newCooksIds = orderInfo.cooks.filter(cookId => !orderCurrent.cooks.includes(cookId))

                for (const newCookId of newCooksIds) {
                    const userInfo = await this.usersRepo.getById(newCookId)

                    if (userInfo.role !== ROLES.Cook) {
                        throw new IncorrectOrderParametersException(`User № ${newCookId} not a cook`)
                    }

                    await this.performersRepo.add(new PerformerCreateModel(newCookId, id))
                }
            }

            if (orderInfo.waiters === undefined) {
                orderInfo.waiters = orderCurrent.waiters
            } else {
                // Удалять нельзя.
                const missingWaiters = orderCurrent.waiters.filter(waiterId => !orderInfo.waiters.includes(waiterId))
                if (missingWaiters.length !== 0) {
                    throw new IncorrectOrderParametersException(`Waiters ${missingWaiters} cannot be removed from the order.`)
                }

                // Определяем новых поворов
                const newWaitersIds = orderInfo.waiters.filter(waiterId => !orderCurrent.waiters.includes(waiterId))

                for (const newWaiterId of newWaitersIds) {
                    const userInfo = await this.usersRepo.getById(newWaiterId)

                    if (userInfo.role !== ROLES.Waiter) {
                        throw new IncorrectOrderParametersException(`User № ${newWaiterId} not a waiter`)
                    }

                    await this.performersRepo.add(new PerformerCreateModel(newWaiterId, id))
                }
            }

            if (orderInfo.orderCooksStatus === OrderStaffStatus.Ready &&
                orderInfo.orderWaitersStatus === OrderStaffStatus.Ready &&
                orderInfo.orderStatus === OrderStatus.Preparing) {
                orderInfo.orderStatus = OrderStatus.Prepared
            }

            const {cooks, waiters, ...orderInfoWithoutArray} = orderInfo

            const query = format(`UPDATE ${this._table} SET (status, cooks_status, waiters_status)
                = (%L) WHERE id = ${id}`, Object.values(orderInfoWithoutArray))

            await this._client.query(query)

            await this._client.query("COMMIT;")
        } catch (e) {
            await this._client.query("ROLLBACK;")
            throw e
        }

        return await this.getById(id)
    }

    async getById(id) {
        const filter = new FilterModel()
        filter.addFilterItem(new FilterItemModel("id", id))

        const order = await this.getAll(filter)

        if (order.length === 0) {
            throw new NotFoundException()
        }

        return order[0]
    }

    _getOrderFromRow(row) {
        return new OrderModel(row.id, row.restaurant, row.client, row.number_of_persons, row.menu, row.reserved_tables,
            row.comment, row.score, row.visit_time, row.status, row.cooks_status, row.waiters_status, row.time_created)
    }


}

module.exports = OrdersRepository
