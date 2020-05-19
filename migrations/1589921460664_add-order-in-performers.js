/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.addColumn('orders_performers', {
        order_id: {
            type: "integer",
            notNull: true,
            references: 'orders',
            referencesConstraintName: 'orders_performers_orders_id_fk'
        },
    })
};
