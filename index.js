const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { isAuth, sanitizeUser, cookieExtractor } = require('./common');
const path = require('path');
const Razorpay = require('razorpay');
// Import Router
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const cartRouter = require('./routes/cart');
const brandRouter = require('./routes/brand');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');
const userRouter = require('./routes/user');
const paymentRouter = require('./routes/payment');

const server = express();
server.use(cookieParser());


const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET_KEY;

require('dotenv').config();



// Middlewares
// Serve static files from the React app
// server.use(express.static(path.join(__dirname, 'client/build')));

// for front-end 
server.use(express.static(path.resolve(__dirname, 'build')));

server.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'build'));
});

server.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	// store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

server.use(passport.authenticate('session'));

server.use(cors({ exposedHeaders: ['X-TOTAL-COUNT'] }))


server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

const connectWithDb = require('./config/database');
connectWithDb();


//start the server

server.listen(PORT, () => {
	console.log(`App is started at Port no ${PORT}`);
});


server.get('/api/v1', (req, res) => {
	// console.log(req.session);
	res.send(`Why So Serious`);
});


server.get('/api/v1/getkey', (req, res) => {
	res.status(200).json({ key: process.env.RAZORPAY_KEY_ID })
})


server.use('/api/v1/products', isAuth(), productRouter);

server.use('/api/v1/brands', isAuth(), brandRouter);

server.use('/api/v1/categories', isAuth(), categoryRouter);

server.use('/api/v1/users', isAuth(), userRouter);

server.use('/api/v1/auth', authRouter);

server.use('/api/v1/cart', isAuth(), cartRouter);

server.use('/api/v1/orders', isAuth(), orderRouter);

server.use('/api/v1/payments', isAuth(), paymentRouter)


// this line we add to make react router work in case of other routes doesnt match
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));



// Passport Methods

// Local strategy
passport.use('local', new LocalStrategy(
	{ usernameField: 'email' },
	async function (email, password, done) {
		// console.log('here-local');
		// console.log('email- ', email, password);
		try {
			const user = await User.findOne({ email: email }).exec();
			if (!user) {
				return done(null, false, { message: 'User Not Registered' });
			}
			else if (await bcrypt.compare(password, user.password)) {
				const token = jwt.sign(sanitizeUser(user), process.env.SECRET_KEY);
				done(null, { id: user.id, role: user.role, token }, { message: 'Logged in Successfully' });
			}
			else {
				done(null, false, { message: 'Invalid Credentials' });
			}
		}
		catch (err) {
			done(err);
		}
	}
));


passport.use(
	'jwt',
	new JwtStrategy(opts, async function (jwt_payload, done) {
		try {
			const user = await User.findById(jwt_payload.id);
			if (user) {
				return done(null, sanitizeUser(user));
			} else {
				return done(null, false);
				// or you could create a new account
			}

		} catch (err) {
			return done(err, false);
		}
	})
);



passport.serializeUser(function (user, cb) {
	// console.log('serialise- ', user);
	process.nextTick(function () {
		return cb(null, sanitizeUser(user));
	});
});

passport.deserializeUser(async function (user, cb) {
	const userInfo = await User.findById(user.id);
	// console.log('deserialise- ', userInfo);
	process.nextTick(function () {
		return cb(null, userInfo);
	});
});




// items: req.body.items,
// 	user: req.body.user,
// 		paymentMethod: req.body.paymentMethod,
// 			selectedAddress: req.body.selectedAddress,
// 				status: req.body.status,