/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.alterColumn('orders', 'time_created', {
        default: null
    })
};
