const BaseRepository = require('./BaseRepository')
const InvalidArgumentException = require('../../models/Exceptions/InvalidArgumentException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const format = require('pg-format');
const OrderModel = require('../../models/OrderModel')
const OrdersExtractorService = require('../OrdersExtractorService')
const FilterToWhereService = require('../FilterToWhereService')

class OrdersRepository extends BaseRepository {
    constructor(_client, tableName, restaurantsRepo, menuRepo, tablesRepo, scoresRepo, performersRepo, usersRepo) {
        super(_client, tableName)

        this.restaurantRepo = restaurantsRepo
        this.dishesRepo = menuRepo
        this.tablesRepo = tablesRepo
        this.scoresRepo = scoresRepo
        this.performersRepo = performersRepo
        this.usersRepo = usersRepo

        this.ordersExtractorService = new OrdersExtractorService(this.performersRepo, this.scoresRepo, this.usersRepo)
    }

    async getAll(filter) {
        const query = `SELECT * FROM ${this._table} ${FilterToWhereService.convertFilterToWhere(filter)};`

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
        return null;

        // try {
        //     await this.restaurantRepo.getById(restaurantId)
        // } catch (e) {
        //     if (e instanceof NotFoundException) {
        //         throw new NotFoundException(`Restaurant ${restaurantId} not found`)
        //     } else {
        //         throw e
        //     }
        // }
        //
        // try {
        //     await this.dishesRepo.getById(menuItemInfo.dish)
        // } catch (e) {
        //     if (e instanceof NotFoundException) {
        //         throw new NotFoundException(`Dish ${menuItemInfo.dish} not found`)
        //     } else {
        //         throw e
        //     }
        // }
        //
        // const query = format(`INSERT INTO ${this._table} (dish, price, restaurant)
        //     VALUES (%s, %s, %s) RETURNING  *`, menuItemInfo.dish, menuItemInfo.price, restaurantId);
        //
        // const result = await this._client.query(query)
        // return this._getMenuItemFromRow(result.rows[0])
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
        const filter = {
            id: id
        }

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
        return new OrderModel(row.id, row.restaurant, row.client, row.menu, row.reserved_tables,
            row.comment, row.score, row.visit_time, row.status, row.cooks_status, row.waiters_status)
    }


}

module.exports = OrdersRepository
