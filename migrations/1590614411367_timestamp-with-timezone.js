/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.alterColumn('orders', 'time_created', {
        type: 'timestamp with time zone'
    })
};
