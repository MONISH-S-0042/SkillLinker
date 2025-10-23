module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be Signed in!');
        return res.redirect('/login');
    }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.isPoster = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be Signed in!');
        return res.redirect('/login');
    }
    if (req.user.role !== 'poster') {
        req.flash('error','Invalid operation');
        return res.redirect('/home');
    }
    next();
}
module.exports.isSeeker = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be Signed in!');
        return res.redirect('/login');
    }
    if (req.user.role !== 'seeker') {
        req.flash('error','Invalid operation');
        return res.redirect('/home');
    }
    next();
}