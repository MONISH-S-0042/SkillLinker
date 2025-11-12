require('dotenv').config();
require('./agenda');
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const ejsMate = require('ejs-mate');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const { User } = require('./models/User');
const { Chat } = require('./models/Chat');
const { Application } = require('./models/Application');
const { isLoggedIn, storeReturnTo, isPoster, isSeeker } = require('./middleware');
const posterRoutes = require('./routes/posterRoutes');
const seekerRoutes = require('./routes/seekerRoutes');
const userRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/apiRoutes');
const ExpressError = require('./utils/ExpressError');
const multer = require('multer');
const { storage, cloudinary } = require('./cloudinary/index');
const { Socket } = require('socket.io');
const upload = multer({ storage });
const moment = require('moment');
const { name } = require('ejs');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.set('public', path.join(__dirname, '/public'));
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/skill-linker'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Mongo Connection open");
    })
    .catch((e) => {
        console.log("Mongo error->", e);
    });

const store = new MongoStore({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
})
store.on('error', function (e) {
    console.log("Session store error");
})
const sessionConfig = {
    store,
    name: 'role',
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),//a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
let username;
app.use(async (req, res, next) => {
    res.locals.currentUser = req.user;
    username = req.user && req.user.username;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.role = req.user ? req.user.role : null;
    next();
});
app.get('/', (req, res) => {
    if (req.user) return res.redirect('/home')
    res.render("users/home");
})
app.get('/home', isLoggedIn, (req, res) => {
    const role = req.user.role;
    res.render(`${role}/home`);
})
app.use('/poster', posterRoutes);
app.use('/seeker', seekerRoutes);
app.use('/api', apiRoutes);
app.use('/', userRoutes);


app.get('/api/get/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    res.json({
        id: user?._id
    });
})
app.get('/api/getRooms', async (req, res) => {
    const rooms = await Chat.find({
        $or: [
            { room: { $regex: req.user.username } },
            { room: "General_room" }
        ],
    }, { room: 1 });
    let userRooms = [];
    for (let room of rooms) {
        userRooms.push(room.room);
    }
    return res.json(userRooms);
})
app.get('/chat', async (req, res) => {
    if (!req.query || !req.query.user1 || !req.query.user2)
        return res.render('chat', { name: req.user.username });
    const { user1, user2 } = req.query;
    const room = [user1, user2];
    if (!room.includes(req.user.username) && room.join('_') !== 'General_room') {
        req.flash('error', 'Invalid Access');
        return res.redirect('/home');
    }
    res.render('chat', { name: req.user.username });
})
let users = [];
function addUser(id, username, room) {
    const user = { id, username, room }
    users.push(user);
    return user;
}
function removeUser(id) {
    users = users.filter(user => user.id !== id);
}
function getUser(id) {
    return users.find(user => user.id === id);
}

async function saveHistoryAndRoom(room, msg) {
    let addRoom = await Chat.findOne({ room });
    if (!addRoom) {
        addRoom = new Chat({ room });
    }
    if (msg) addRoom.messages.push({ ...msg });
    await addRoom.save();
}
async function restoreHistory(room) {
    const messages = (await Chat.findOne({ room }))?.messages;
    return messages;
}
io.on('connection', socket => {
    socket.on('joinRoom', async ({ myName, room }) => {
        const user = addUser(socket.id, myName, room);
        const isRoom = await Chat.findOne({ room: user.room });
        if (!isRoom) {
            await saveHistoryAndRoom(user.room);
            io.emit('new-user-info');
        }
        socket.join(user.room);
        // socket.emit('chat-history', await restoreHistory(user.room));
    })
    socket.on('send-msg', async data => {
        const user = getUser(socket.id);
        saveHistoryAndRoom(user.room, data);
        io.to(user.room).emit('chat-message', data);
    })
    socket.on('get-history', async (room) => {
        socket.emit('chat-history', await restoreHistory(room));
    })
    socket.on('leave', (room) => {
        socket.leave(room);
        removeUser(socket.id);
    })
    socket.on('disconnect', () => {
        removeUser(socket.id);
    })
})


function formatMsg(msg, username) {
    return {
        username,
        message: msg,
        time: moment().format('hh:mm a')
    }
}









app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong!!"
    res.status(statusCode).render('error', { err });
})
server.listen(process.env.PORT ||3000, () => {
    console.log("Listening on port 3000");
});
