/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.renameColumn('orders', 'dishes', 'menu')
    pgm.dropColumn('orders', 'is_paid')
    pgm.dropColumn('orders', 'visit_time')
}
