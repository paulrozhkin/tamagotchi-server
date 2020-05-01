class RestaurantUpdatableInfoModel {
    constructor(isParkingPresent, isCardPaymentPresent,
                isWifiPresent, photos,
                isDeleted) {
        this.isParkingPresent = isParkingPresent !== undefined ? isParkingPresent : false;
        this.isCardPaymentPresent = isCardPaymentPresent !== undefined ? isCardPaymentPresent : false;
        this.isWifiPresent = isWifiPresent !== undefined ? isWifiPresent : false;
        this.photos = photos !== undefined && photos !== null ? photos : [];
        this.isDeleted = isDeleted !== undefined ? isDeleted : false;
    }
}

module.exports = RestaurantUpdatableInfoModel
