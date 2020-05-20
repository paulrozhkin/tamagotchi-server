const BaseRepository = require('./BaseRepository')
const InvalidArgumentException = require('../../models/Exceptions/InvalidArgumentException')
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
        if (visitTimeStart - new Date() < 0) {
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
            visit_time: `('${visitTimeStart.toISOString()}', '${visitTimeEnd.toISOString()}')`
        }

        const query = format(`INSERT INTO ${this._table} (restaurant, client, comment, number_of_persons, status, visit_time)
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

        // Бронируем столик
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

            const queryPaymentMade = format(`UPDATE ${this._table} SET (status, menu)
             = (%L, '{${format.string(order.menu)}}') WHERE id = ${newOrderId}`, OrderStatus.PaymentMadeing)
            await this._client.query(queryPaymentMade)
        } else {
            // Иначе на этом обработка создания завершена и мы просто ждем клиента в ресторане в назначенное время
            // (после подготовки его столика
            const queryTimeConfirmed = format(`UPDATE ${this._table} SET status
             = %L WHERE id = ${newOrderId}`, OrderStatus.Confirmed)
            await this._client.query(queryTimeConfirmed)
        }

        return this.getById(newOrderId)
    }

    async update(restaurantId, id, updatableMenuItem) {
        return null;
        // const menuItemCurrent = await this.getById(restaurantId, id)
        //
        // if (updatableMenuItem.price === undefined) {
        //     updatableMenuItem.price = menuItemCurrent.price
        // }
        //
        // if (updatableMenuItem.isDeleted === undefined) {
        //     updatableMenuItem.isDeleted = menuItemCurrent.isDeleted
        // }
        //
        // const query = format(`UPDATE ${this._table} SET (price, is_deleted)
        //     = (%L, %L) WHERE id = ${id}`, updatableMenuItem.price, updatableMenuItem.isDeleted)
        //
        // await this._client.query(query)
        //
        // return await this.getById(restaurantId, id)
    }

    async getById(id) {
        const filter = new FilterModel()
        filter.addFilterItem(new FilterItemModel("id", id))

        const order = await this.getAll(filter)

        if (order.length === 0) {
            throw new NotFoundException()
        }

        return order[0]

        // let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}' and restaurant='${restaurantId}';`)
        // if (result.rowCount > 0) {
        //     return this._getMenuItemFromRow(result.rows[0])
        // } else {
        //     throw new NotFoundException()
        // }
    }

    _getOrderFromRow(row) {
        return new OrderModel(row.id, row.restaurant, row.client, row.number_of_persons, row.menu, row.reserved_tables,
            row.comment, row.score, row.visit_time, row.status, row.cooks_status, row.waiters_status)
    }


}

module.exports = OrdersRepository
