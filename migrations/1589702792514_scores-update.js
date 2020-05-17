/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.dropColumn('scores', 'payment_amount')
    pgm.addColumn('scores', {
        'payment_amount': {
            type: 'integer'
        }
    })
}
