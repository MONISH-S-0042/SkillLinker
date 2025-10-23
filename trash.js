app.get('/poster/addJob', isPoster, (req, res) => {
    res.render('poster/newJob');
})
app.post('/poster/addJob', isPoster, async (req, res) => {
    let { title, description, skills, pay, modeType, duration } = req.body;
    const updateData = { title, description, owner: req.user, pay, duration };
    let skillArray = skills.split(',')
        .map(el => el.trim())
        .filter(el => el.length > 0);
    if (!skillArray.length) {
        skillArray = ['None'];
    }
    const mode = {
        type: modeType
    }
    if (req.body.address) {
        mode.address = req.body.address;
    }
    updateData.mode = mode;
    updateData.req_skills = skillArray;
    const newJob = new Job(updateData);
    await newJob.save();
    res.redirect('/home');
});

app.get('/seeker/getJobs', isSeeker, async (req, res) => {
    let jobs = await Job.find({ status: 'active' });
    jobs.sort((a, b) => new Date(b.created) - new Date(a.created));
    res.render('seeker/jobs', { jobs });
});
app.get('/seeker/:id/jobDesc', isSeeker, async (req, res) => {
    const job = await Job.findById(req.params.id).populate('owner');
    const application = await Application.findOne({ job: job._id, applicant: req.user._id });
    res.render('seeker/showJob', { job, application });
});
app.post('/seeker/:id/applyJob', isSeeker, async (req, res) => {
    const { acceptTerms, user_description } = req.body;
    if (!acceptTerms) {
        req.flash('error', 'Agree to terms and conditions');
    }
    const job = await Job.findById(req.params.id).populate('owner');
    if(job.status==='completed'){
        req.flash('error','Applications are no longer accepted');
        return res.redirect('/seeker');
    }
    const applicationData = {
        job,
        applicant: req.user,
    }
    if (user_description) {
        applicationData.user_description = user_description;
    }
    const application = new Application(applicationData);
    await application.save();
    req.flash('success', 'Successfully Applied');
    res.redirect(`/seeker/${job._id}/jobDesc`);
})
app.get('/profile', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('users/profile', { user });
})
app.get('/removeProfilePicture', isLoggedIn, async (req, res) => {
    const oldPic = (await User.findById(req.user._id)).profilePic;
    if (oldPic.url !== '/images/person-icon.jpeg' && oldPic.filename) {
        await cloudinary.uploader.destroy(oldPic.filename);
    }
    await User.findOneAndUpdate({ _id: req.user._id }, { profilePic: { url: '/images/person-icon.jpeg' } });
    res.redirect('/profile');
})
app.get('/editProfile', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('users/editProfile', { user });
})
app.post('/editProfile', isLoggedIn,
    upload.fields([
        { name: 'profilePic', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    async (req, res) => {
        const { name, skillsStr, DOB, gender, company_name } = req.body;
        const skills = skillsStr.split(",")
            .map(el => el.trim())
            .filter(el => el.length > 0);
        const updateData = { skills, DOB, FullName: name };
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
        if (gender) {
            updateData.gender = gender;
        }
        if (company_name) {
            updateData.company_name = company_name;
        }
        await User.findByIdAndUpdate(req.user._id, updateData, { runValidators: true });
        res.redirect('/profile');
    })



app.get('/register', (req, res) => {
    res.render('users/register');
})
app.post('/register', storeReturnTo, async (req, res) => {
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
})
app.get('/login', (req, res) => {
    res.render('users/login');
})
app.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), async (req, res) => {
    req.flash('success', `Welcome Back, ${req.user.username}`);
    const redirectUrl = res.locals.returnTo || '/home'
    res.redirect(redirectUrl);
})
app.get('/logout', async (req, res) => {
    req.logOut(function (err) {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully');
        res.redirect('/');
    })
})
