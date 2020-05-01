const BaseRepository = require('./BaseRepository')
const RestaurantPropertiesException = require('../../models/Exceptions/RestaurantPropertiesException')
const RestaurantExistException = require('../../models/Exceptions/RestaurantExistException')
const NotFoundException = require('../../models/Exceptions/NotFoundException')
const RestaurantModel = require('../../models/RestaurantModel')

class RestaurantsRepository extends BaseRepository {

    async getAll() {
        const result = await this._client.query(`SELECT * FROM ${this._table};`)

        const restaurants = []
        result.rows.forEach(restaurantRow => {
            restaurants.push(this._getRestaurantFromRow(restaurantRow))
        })

        return restaurants
    }

    async add(restaurant) {
        const checkQuery = `FROM ${this._table} `

        let checkExistResult = await this._client.query(`SELECT COUNT(*) 
        FROM ${this._table} 
        WHERE position_latitude = '${restaurant.positionLatitude}' and position_longitude = '${restaurant.positionLongitude}'`)
        let count = parseInt(checkExistResult.rows[0].count)

        if (count !== 0) {
            throw new RestaurantExistException()
        }

        const query = `
        INSERT INTO ${this._table} (address, position_latitude, position_longitude)
         VALUES ('${restaurant.address}', '${restaurant.positionLatitude}', '${restaurant.positionLongitude}') 
         RETURNING  *`

        const result = await this._client.query(query)
        return this._getRestaurantFromRow(result.rows[0])
    }

    async update(id, restaurant) {
        const query = `
        UPDATE ${this._table} SET (is_parking_present, is_card_payment_present, is_wifi_present, is_deleted, photos)
         = ('${restaurant.isParkingPresent}', '${restaurant.isCardPaymentPresent}', 
         '${restaurant.isWifiPresent}', '${restaurant.isDeleted}', '{${restaurant.photos}}') 
         WHERE id = ${id}`

        const result = await this._client.query(query)
        return await this.getById(id)
    }

    async getById(id) {
        let result = await this._client.query(`SELECT * FROM ${this._table} WHERE id = '${id}';`)
        if (result.rowCount > 0) {
            return this._getRestaurantFromRow(result.rows[0])
        } else {
            throw new NotFoundException()
        }
    }

    _getRestaurantFromRow(row) {
        return new RestaurantModel(row.id, row.address,
            row.position_latitude, row.position_longitude,
            row.is_parking_present, row.is_card_payment_present,
            row.is_wifi_present, row.photos,
            row.is_deleted)

    }
}

module.exports = RestaurantsRepository
