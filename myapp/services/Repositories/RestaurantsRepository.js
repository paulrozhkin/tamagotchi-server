const BaseRepository = require('./BaseRepository');

class RestaurantsRepository extends BaseRepository {

    async getAll() {
        const res = await this._client.query('SELECT * FROM public.restaurants;');
        return res.rows;
    }

    async add(restaurant) {

    }

    async update(restaurant) {

    }

    async delete(id) {

    }

    async getById(id) {

    }
}

module.exports = RestaurantsRepository;
