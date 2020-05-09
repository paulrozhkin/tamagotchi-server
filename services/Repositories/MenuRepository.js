const BaseRepository = require('./BaseRepository')
const InvalidArgumentException = require('../../models/Exceptions/InvalidArgumentException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const format = require('pg-format');
const MenuItemModel = require('../../models/MenuItemModel')

class MenuRepository extends BaseRepository {
    constructor(_client, tableName, Restaurants, Dishes) {
        super(_client, tableName)

        this.restaurantRepo = Restaurants
        this.dishesRepo = Dishes
    }


    async getAllByRestaurant(restaurantId) {
        const result = await this._client.query(`SELECT * FROM ${this._table} WHERE restaurant=${restaurantId};`)

        const menu = []
        result.rows.forEach(menuItemRow => {
            menu.push(this._getMenuItemFromRow(menuItemRow))
        })

        return menu
    }

    async add(restaurantId, menuItemInfo) {

        try {
            await this.restaurantRepo.getById(restaurantId)
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw new NotFoundException(`Restaurant ${restaurantId} not found`)
            } else {
                throw e
            }
        }

        try {
            await this.dishesRepo.getById(menuItemInfo.dish)
        } catch (e) {
            if (e instanceof NotFoundException) {
                throw new NotFoundException(`Dish ${menuItemInfo.dish} not found`)
            } else {
                throw e
            }
        }

        const query = format(`INSERT INTO ${this._table} (dish, price, restaurant)
            VALUES (%s, %s, %s) RETURNING  *`, menuItemInfo.dish, menuItemInfo.price, restaurantId);

        const result = await this._client.query(query)
        return this._getMenuItemFromRow(result.rows[0])
    }

    async update(restaurantId, id, updatableMenuItem) {
        const menuItemCurrent = await this.getById(restaurantId, id)

        if (updatableMenuItem.price === undefined) {
            updatableMenuItem.price = menuItemCurrent.price
        }

        if (updatableMenuItem.isDeleted === undefined) {
            updatableMenuItem.isDeleted = menuItemCurrent.isDeleted
        }

        const query = format(`UPDATE ${this._table} SET (price, is_deleted)
            = (%L, %L) WHERE id = ${id}`, updatableMenuItem.price, updatableMenuItem.isDeleted)

        await this._client.query(query)

        return await this.getById(restaurantId, id)
    }

    async getById(restaurantId, id) {
        let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}' and restaurant='${restaurantId}';`)
        if (result.rowCount > 0) {
            return this._getMenuItemFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getMenuItemFromRow(row) {
        return new MenuItemModel(row.id, row.dish, row.price, row.is_deleted)
    }
}

module.exports = MenuRepository
