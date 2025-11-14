import express from 'express'
import mongoose from 'mongoose'
import Idea from '../models/Idea.js'

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
    return res.json(ideas)
  } catch (err) {
    console.log(err)
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
    return res.json(idea)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

// @route           POST /api/ideas
// @description     Create a brand new idea
// @access          Public
ideaRoutes.post('/', async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body

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
    })

    const saveIdea = await newIdea.save()

    return res.status(201).json(saveIdea)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

// @route           DELETE /api/ideas/:id
// @description     Delete a single idea
// @access          Public
ideaRoutes.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea not found')
    }

    const idea = await Idea.findByIdAndDelete(id)
    if (!idea) {
      res.status(404)
      throw new Error('Idea not found')
    }
    return res.json({ message: 'Idea deleted successfully' })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

// @route           PUT /api/ideas/:id
// @description     Update an idea
// @access          Public
ideaRoutes.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea not found')
    }

    const { title, summary, description, tags } = req.body

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400)
      throw new Error('Title, summary, and description are required!')
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags: Array.isArray(tags)
          ? tags
          : tags.split(',').map((tag) => tag.trim()),
      },
      { new: true, runValidators: true }
    )

    if (!updatedIdea) {
      res.status(404)
      throw new Error('Idea not found')
    }
    return res.json(updatedIdea)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export default ideaRoutes
