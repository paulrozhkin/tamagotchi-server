class RestaurantModel {
    id;
    address;
    positionLatitude;
    positionLongitude;
    isParkingPresent;
    isCardPaymentPresent;
    isWifiPresent;
    photos;
    isDeleted;

    constructor(id, address,
                    positionLatitude, positionLongitude,
                    isParkingPresent, isCardPaymentPresent,
                    isWifiPresent, photos,
                    isDeleted) {
        this.id = id;
        this.address = address;
        this.positionLatitude = positionLatitude;
        this.positionLongitude = positionLongitude;
        this.isParkingPresent = isParkingPresent;
        this.isCardPaymentPresent = isCardPaymentPresent;
        this.isWifiPresent = isWifiPresent;
        this.photos = photos;
        this.isDeleted = isDeleted

    }
}

module.exports = RestaurantModel
