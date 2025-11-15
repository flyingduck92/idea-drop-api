import express from 'express'
import mongoose from 'mongoose'
import Idea from '../models/Idea.js'
import { logger } from '../utils/logger.js'
import { protect } from '../middleware/authMiddleware.js'

const ideaRoutes = express.Router()

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
// @query           _limit (optional limit for ideas return)
ideaRoutes.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit)
    const query = Idea.find().sort({ createdAt: -1 })

    if (!isNaN(limit)) {
      query.limit(limit)
    }

    const ideas = await query.exec()
    logger.info({ count: ideas.length }, 'Ideas fetches')
    return res.json(ideas)
  } catch (err) {
    logger.error(err, 'Error fetching ideas')
    next(err)
  }
})

// @route           GET /api/ideas/:id
// @description     Get a single idea
// @access          Public
ideaRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea not found')
    }

    const idea = await Idea.findById(id)
    if (!idea) {
      res.status(404)
      throw new Error('Idea not found')
    }
    logger.info({ ideaId: id }, 'Idea fetched')
    return res.json(idea)
  } catch (err) {
    logger.error(err, 'Error fetching idea')
    next(err)
  }
})

// @route           POST /api/ideas
// @description     Create a brand new idea
// @access          Public
ideaRoutes.post('/', protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {}

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400)
      throw new Error('Title, summary, and description are required!')
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === 'string'
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user.id,
    })

    const saveIdea = await newIdea.save()
    logger.info({ ideaId: saveIdea._id }, 'Idea created successfully')

    return res.status(201).json(saveIdea)
  } catch (err) {
    logger.error(err, 'Error creating idea')
    next(err)
  }
})

// @route           DELETE /api/ideas/:id
// @description     Delete a single idea
// @access          Public
ideaRoutes.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea not found')
    }

    const idea = await Idea.findById(id)
    if (!idea) {
      res.status(404) // not found
      throw new Error('Idea not found')
    }

    // check if user own idea
    if (idea.user.toString() !== req.user.id.toString()) {
      res.status(403) // forbidden/not authorizated
      throw new Error('Not authorizated to delete this idea')
    }

    await idea.deleteOne()

    logger.info({ ideaId: id }, 'Idea deleted successfully')
    return res.json({ message: 'Idea deleted successfully' })
  } catch (err) {
    logger.error(err, 'Error deleting idea')
    next(err)
  }
})

// @route           PUT /api/ideas/:id
// @description     Update an idea
// @access          Public
ideaRoutes.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea not found')
    }

    const idea = await Idea.findById(id)

    if (!idea) {
      res.status(404)
      throw new Error('Idea not found')
    }

    // check if user own idea
    if (idea.user.toString() !== req.user.id.toString()) {
      res.status(403) // forbidden/not authorizated
      throw new Error('Not authorizated to update this idea')
    }

    const { title, summary, description, tags } = req.body || {}

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400)
      throw new Error('Title, summary, and description are required!')
    }

    idea.title = title
    idea.summary = summary
    idea.description = description
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    const updatedIdea = await idea.save()

    logger.info({ ideaId: id }, 'Idea updated successfully')
    return res.json(updatedIdea)
  } catch (err) {
    logger.error(err, 'Error deleting idea')
    next(err)
  }
})

export default ideaRoutes
