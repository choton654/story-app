const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require('../models/Story');

// @desc   add stories
// @route  GET /stories/add
router.get('/add', ensureAuth, (req, res) => res.render('stories/add'));

// @desc  post stories
// @route    POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

// @desc   get stories
// @route  GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('stories/index', { stories });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

// @desc   edit stories
// @route  GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();
    if (!story) {
      res.render('error/400');
    }
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', { story });
    }
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

// @desc   show single storie
// @route  GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id })
      .populate('user')
      .lean();
    if (!story) {
      res.render('error/400');
    }
    res.render('stories/show', { story });
  } catch (error) {
    console.error(error);
    res.render('error/400');
  }
});

// @desc   edit stories
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      res.render('error/400');
    }
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      story = await Story.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

// @desc   delete stories
// @route  DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

// @desc   show user stories
// @route  GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      satus: 'public',
    })
      .populate('user')
      .lean();
    console.log(stories);

    res.render('stories/index', { stories });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

module.exports = router;
