/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.addColumn('orders', {
        number_of_persons: {
            type: 'integer'
        }
    })
    pgm.sql('UPDATE orders SET number_of_persons = 1')
    pgm.alterColumn('orders', 'number_of_persons', {
            notNull: true
    })
};
