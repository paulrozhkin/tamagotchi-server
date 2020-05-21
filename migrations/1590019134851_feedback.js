/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('feedback', {
        id: {
            type: "serial",
            primaryKey: true,
            notNull: true
        },
        user_id: {
            type: "integer",
            notNull: true,
            references: 'users',
            referencesConstraintName: 'feedback_users_id_fk'
        },
        feedback: {
            type: "string",
            notNull: true
        },
        created_time: {
            type: "timestamp",
            notNull: true
        }
    })

};
