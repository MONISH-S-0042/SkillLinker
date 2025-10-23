const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { cloudinary } = require('../cloudinary/index');
module.exports.profilePage = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/profile', { user });
};
module.exports.deleteProfilePicture = async (req, res) => {
    const oldPic = (await User.findById(req.user._id)).profilePic;
    if (oldPic.url !== '/images/person-icon.jpeg' && oldPic.filename) {
        await cloudinary.uploader.destroy(oldPic.filename);
    }
    await User.findOneAndUpdate({ _id: req.user._id }, { profilePic: { url: '/images/person-icon.jpeg' } });
    res.redirect(`/${req.user._id}/profile`);
};
module.exports.editProfilePageForm = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('users/editProfile', { user });
};

module.exports.editProfilePage = async (req, res) => {
    const { name, DOB, gender, company_name } = req.body;
    const updateData = { DOB, FullName: name };
    if (req.user.role === 'seeker' && req.body.skillsStr) {
        const skillsStr = req.body.skillsStr;
        const skills = skillsStr?.split(",")
            .map(el => el.trim())
            .filter(el => el.length > 0);
        updateData.skills=skills;
    }
    if (req.files && req.files.profilePic) {
        updateData.profilePic = {
            url: req.files.profilePic[0].path,
            filename: req.files.profilePic[0].filename
        };
        const oldPic = (await User.findById(req.user._id)).profilePic;
        if (oldPic.url !== '/images/person-icon.jpeg' && oldPic.filename) {
            await cloudinary.uploader.destroy(oldPic.filename);
        }
    }
    if (req.files && req.files.resume) {
        updateData.resume = {
            url: req.files.resume[0].path,
            filename: req.files.resume[0].filename
        };
        const oldResume = (await User.findById(req.user._id)).resume;
        if (oldResume.filename) {
            await cloudinary.uploader.destroy(oldResume.filename, { resource_type: 'raw' });
        }
    }
    if (req.user.role === 'seeker' && req.body.job_category) {
        updateData.job_category = req.body.job_category;
    }
    if (gender) {
        updateData.gender = gender;
    }
    if (company_name) {
        updateData.company_name = company_name;
    }
    await User.findByIdAndUpdate(req.user._id, updateData, { runValidators: true });
    res.redirect(`/${req.user._id}/profile`);
};

module.exports.registerForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, role, gender } = req.body;
        const user = new User({ email, username, role, gender });
        const registerUser = await User.register(user, password);
        req.login(registerUser, (err) => {
            if (err) {
                req.flash("error", 'try again');
                return res.redirect('/login')
            }
            req.flash('success', `Registered Successfully, ${username}`);
            const redirectUrl = res.locals.returnTo || '/home'
            res.redirect(redirectUrl);
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = async (req, res) => {
    req.flash('success', `Welcome Back, ${req.user.username}`);
    const redirectUrl = res.locals.returnTo || '/home'
    res.redirect(redirectUrl);
};

module.exports.logout = async (req, res) => {
    req.logOut(function (err) {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully');
        res.redirect('/');
    })
};
module.exports.deleteNotification=async(req,res)=>{
    const {notifyId}=req.params;
    await Notification.findOneAndDelete({user:req.user._id,_id:notifyId});
    req.flash('success','Notification deleted permanently');
    res.redirect('/notification');
}
module.exports.notification=async(req,res)=>{
    const notifications=await Notification.find({user:req.user._id}).sort({created:-1});
    res.render('users/notification',{notifications});
}