class BaseRepository {
    _client;

    constructor(dbClient) {
        this._client = dbClient;
    }
}

module.exports = BaseRepository;