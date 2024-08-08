const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const Question = require('./models/ques')
const Answer = require('./models/ans')
require('dotenv').config()

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => { console.log("Connected...") })
    .catch(() => { console.log("An Error Occured") })

const PORT = process.env.PORT || 3000;

const app = express()

app.use(session({
    secret: 'Hello_World!',
    resave: false,
    saveUninitialized: true,
}))



app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))
app.use((req, res, next) => {
    res.locals.user = req.session.user; // Make session user available in all EJS views
    res.locals.msg = req.session.msg;
    delete req.session.msg; // Clear the message after it is used
    next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.session.msg = 'Please log in first.';
    res.redirect('/login');
}

// Get Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/home', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find();
        const ques = await Question.find(); // Assuming questions are not user-specific
        const d = new Date();
        console.log(`User Entered At: ${d.toLocaleDateString()}-${d.toLocaleTimeString()}`);
        res.render('home', { r: posts, q: ques });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send("Server Error");
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/posts', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.session.user.id }) // Get posts for the logged-in user
        res.render('posts', { r:posts });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send("Server Error");
    }
});


app.get('/post', isAuthenticated, (req, res) => {
    res.render('post');
});

app.get('/ques', isAuthenticated, (req, res) => {
    res.render('ques');
});

app.get('/comments', isAuthenticated, async (req, res) => {
    try {
        // Find all posts created by the logged-in user
        const userPosts = await Post.find({ user: req.session.user.id }).select('_id');
        const userQuestions = await Question.find({ user: req.session.user.id }).select('_id');

        // Extract post IDs
        const postIds = userPosts.map(post => post._id);
        const quesIds = userQuestions.map(ques => ques._id);

        // Find comments for those posts, and populate the user and post data
        const comments = await Comment.find({ post: { $in: postIds } })
            .populate('post', 'title')  // Populate post titles
            .populate('user', 'uname'); // Populate usernames who commented

        const answers = await Answer.find({question:{$in:quesIds}})
        .populate('question','topic')
        .populate('user','uname')
        res.render('comments', { com: comments,ans:answers });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send("Server Error");
    }
});




// Post Routes
app.post('/sign', async (req, res) => {
    const { uname, email, pass, toi } = req.body;
    try {
        const existingUser = await User.findOne({ uname });
        if (existingUser) {
            req.session.msg = 'User Already Exists';
            return res.redirect('/');
        }

        const user = new User({
            uname,
            email,
            pass,
            toi
        });
        await user.save();

        req.session.user = {
            id: user._id,
            uname: user.uname
        };
        req.session.msg = 'Signup Successful';
        res.redirect('/home');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(400).send("An Error Occurred");
    }
});

app.post('/log', async (req, res) => {
    const { uname, pass } = req.body;
    try {
        const user = await User.findOne({ uname });
        if (!user) {
            req.session.msg = 'User Not Found';
            return res.redirect('/login');
        }
        if (user.pass !== pass) {
            req.session.msg = 'Wrong Password';
            return res.redirect('/login');
        }

        req.session.user = {
            id: user._id,
            uname: user.uname
        };
        req.session.msg = 'Login Successful';
        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(400).send("An Error Occurred");
    }
});


app.post('/upload', isAuthenticated, upload.single('image'), async (req, res) => {
    if (!req.file) {
        req.session.msg = "No file uploaded";
        return res.redirect('/home');
    }

    const image = req.file.buffer;
    const title = req.body.title;
    const desc = req.body.desc;
    const userId = req.session.user.id;

    try {
        const post = new Post({
            title,
            img: image,
            desc,
            contentType: req.file.mimetype,
            user: userId,
            uname : req.session.user.uname // Reference the user who created the post
        });

        await post.save();
        req.session.msg = 'Post uploaded successfully';
        res.redirect('/home');
    } catch (error) {
        console.error('Error uploading post:', error);
        res.status(400).send("An Error Occurred");
    }
});

app.post('/question', isAuthenticated, async (req, res) => {
    try {
        const ques = new Question({
            topic: req.body.topic,
            question: req.body.question,
            user:req.session.user.id,
            uname:req.session.user.uname
        });
        await ques.save();
        req.session.msg = 'Question uploaded successfully';
        res.redirect('/home');
    } catch (error) {
        console.error('Error uploading question:', error);
        res.status(400).send("An Error Occurred");
    }
});

app.post('/com', isAuthenticated, async (req, res) => {
    const cmt = req.body.comment;
    const postId = req.body.postId;
    const t = await Post.findById(postId);
    const u = await User.findById(req.session.user.id);
    try {
        const newComment = new Comment({
            user: u,
            post: t,
            cmt,
        });
        await newComment.save();
        res.redirect('/home');
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).send("An Error Occurred");
    }
});

app.post('/ans', isAuthenticated, async (req, res) => {
    const ans = req.body.answer;
    const quesId = req.body.quesId;
    const t = await Question.findById(quesId);
    const u = await User.findById(req.session.user.id);
    try {
        const newAnswer = new Answer({
            user: u,
            question: t,
            ans
        });
        await newAnswer.save();
        res.redirect('/home');
    } catch (error) {
        console.error('Error adding answer:', error);
        res.status(400).send("An Error Occurred");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send("An Error Occurred");
        }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server Running At http://localhost:${PORT}`);
});