/* eslint-disable camelcase */

exports.up = pgm => {
    // Enums for states
    pgm.createType("order_status", ["Created", "NoPlace", "PaymentMadeing", "PaymentError",
        "Confirmed", "Preparing", "Prepared", "Completed"])
    pgm.createType('order_staff_status', ["Pending", "Notifying", "Notified", "Ready"])

    // Create columns
    pgm.addColumn('orders', {
        'status': {
            type: 'order_status',
            default: 'Created',
            notNull: true
        }
    })

    pgm.addColumn('orders', {
        'cooks_status': {
            type: 'order_staff_status',
            default: 'Pending',
            notNull: true
        }
    })

    pgm.addColumn('orders', {
        'waiters_status': {
            type: 'order_staff_status',
            default: 'Pending',
            notNull: true
        }
    })
};
