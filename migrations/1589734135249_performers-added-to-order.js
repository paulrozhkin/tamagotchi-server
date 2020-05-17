/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('orders_performers', {
        id: {
            type: "serial",
            primaryKey: true,
            notNull: true
        },
        performer_id: {
            type: "integer",
            notNull: true,
            references: 'users',
            referencesConstraintName: 'orders_performers_users_id_fk'
        },
        start_time: {
            type: 'timestamp',
            notNull: true
        },
        end_time: {
            type: 'timestamp'
        }
    })
};
