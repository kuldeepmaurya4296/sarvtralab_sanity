// Sanity schema: Payment document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'payment',
    title: 'Payment',
    type: 'document',
    fields: [
        defineField({ name: 'user', title: 'User ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'enrollmentRef', title: 'Enrollment', type: 'reference', to: [{ type: 'enrollment' }] }),
        defineField({ name: 'amount', title: 'Amount', type: 'number', validation: r => r.required() }),
        defineField({ name: 'currency', title: 'Currency', type: 'string', initialValue: 'INR' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Pending', 'Completed', 'Failed', 'Refunded'] }, initialValue: 'Pending'
        }),
        defineField({
            name: 'method', title: 'Method', type: 'string',
            options: { list: ['Stripe', 'PayPal', 'Razorpay', 'Bank Transfer'] }, validation: r => r.required()
        }),
        defineField({ name: 'transactionId', title: 'Transaction ID', type: 'string' }),
        defineField({ name: 'razorpayOrderId', title: 'Razorpay Order ID', type: 'string' }),
        defineField({ name: 'razorpayPaymentId', title: 'Razorpay Payment ID', type: 'string' }),
        defineField({ name: 'razorpaySignature', title: 'Razorpay Signature', type: 'string' }),
    ],
    preview: {
        select: { title: 'user', subtitle: 'amount' }
    }
});
