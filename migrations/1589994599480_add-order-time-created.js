/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.addColumn('orders', {
        time_created: {
            type: 'timestamp',
            notNull: true,
            default: "now()"
        }
    })
};
