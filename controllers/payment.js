const razorpay = require('razorpay');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const Payment = require('../models/payment');
const Order = require('../models/orders');
const { totalmem } = require('os');
const User = require('../models/user');
const Product = require('../models/product');
const { sendMail, invoiceTemplate } = require('../common');

require('dotenv').config();

var order_is = null;

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
})






// ROUTE 1 : Create Order Api Using POST Method http://localhost:4000/api/payment/order

exports.getPayment = async (req, res) => {
    // console.log('boddddy- ', req.body);
    const totalAmount = req.body.order.totalAmount;
    order_is = req.body.order;
    try {
        const options = {
            amount: Number(totalAmount * 100),   // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
            notes: {
                items: req.body.order.items, // Additional data can be passed here
                user: req.body.order.user,
                paymentMethod: req.body.order.paymentMethod,
                selectedAddress: req.body.order.selectedAddress,
                status: req.body.order.status
            }
        };
        const orders = await instance.orders.create(options);
        // console.log('orders= ', orders);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Payment request not successful'
        })
    }

};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // console.log('rerrr- ', req.body);
    // console.log('order_is_is-- ', order_is);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    // console.log('body- ', body);

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");
    // console.log('expected-sign-- ', expectedSignature);

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const doc = new Order({
            items: order_is.items,
            totalAmount: order_is.totalAmount,
            totalItems: order_is.totalItems,
            user: order_is.user,
            paymentMethod: order_is.paymentMethod,
            selectedAddress: order_is.selectedAddress,
            status: order_is.status,
            ...req.body
        });
        const order = await doc.save();
        const user = await User.findById(order.user);
        for (let item of order.items) {
            await Product.updateOne({ _id: item.product.id }, { $inc: { 'stock': (-1 * item.quantity) } });
        }
        await sendMail({ to: user.email, html: invoiceTemplate(order), subject: 'Order Received' })
        await Payment.create({
            ...req.body,
        });

        return res.status(200).redirect(`https://ecommerce-b6ia.onrender.com/paymentsuccess/${order.id}`);

    } else {
        res.status(400).json({
            success: false,
        });
    }
};


// exports.getPayment = async (req, res) => {
// 	console.log('here1');
// 	try {
// 		const { totalAmount } = req.body;
// 		console.log('amount- ', totalAmount);
// 		const options = {
// 			totalAmount: Number(totalAmount * 100),
// 			currency: "INR",
// 			receipt: crypto.randomBytes(10).toString("hex"),
// 		}
// 		console.log('options- ', options);

// 		razorpayInstance.orders.create(options, (error, order) => {
// 			if (error) {
// 				console.log(error);
// 				return res.status(500).json({ message: "Something Went Wrong!" });
// 			}
// 			const orders = order;
// 			console.log('orders- ', orders);
// 			res.status(200).json({ data: order });
// 			console.log(order)
// 		});

// 	} catch (error) {
// 		res.status(500).json({ message: "Internal Server Error!" });
// 		console.log(error);
// 	}
// }




// ROUTE 2 : Create Verify Api Using POST Method http://localhost:4000/api/payment/verify
// exports.verifyPayment = async (req, res) => {
// 	const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

// 	// console.log("req.body", req.body);

// 	try {
// 		// Create Sign
// 		const sign = razorpay_order_id + "|" + razorpay_payment_id;

// 		// Create ExpectedSign
// 		const expectedSign = crypto.createHmac("sha256", ({}).RAZORPAY_SECRET)
// 			.update(sign.toString())
// 			.digest("hex");

// 		// console.log(razorpay_signature === expectedSign);

// 		// Create isAuthentic
// 		const isAuthentic = expectedSign === razorpay_signature;

// 		// Condition 
// 		if (isAuthentic) {
// 			const payment = new Order({
// 				...req.body,
// 				razorpay_order_id,
// 				razorpay_payment_id,
// 				razorpay_signature
// 			});

// 			// Save Payment 
// 			await payment.save();

// 			// Send Message 
// 			res.json({
// 				message: "Payement Successfully"
// 			});
// 		}
// 	} catch (error) {
// 		res.status(500).json({ message: "Internal Server Error!" });
// 		console.log(error);
// 	}
// }