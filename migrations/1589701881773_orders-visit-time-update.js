/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.addColumn('orders', {
        'visit_time':
            {
                type: 'tsrange',
                notNull: true
            }
    })
    pgm.addColumn('scores', {
        'payment_token':
            {
                type: 'text'
            }
    })
};
