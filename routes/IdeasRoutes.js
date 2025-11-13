import express from 'express'
const IdeasRoutes = express.Router()

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
IdeasRoutes.get('/', (req, res) => {
  const ideas = [
    { id: 1, title: 'idea 1', description: 'This is idea 1' },
    { id: 2, title: 'idea 2', description: 'This is idea 2' },
    { id: 3, title: 'idea 3', description: 'This is idea 3' },
  ]

  // res.status(404)
  // throw new Error('this is an error')

  return res.json(ideas)
})

// @route           POST /api/ideas
// @description     Create a brand new idea
// @access          Public
IdeasRoutes.post('/', (req, res) => {
  const { title, description } = req.body
  const idea = { title, description }

  return res.send(idea)
})

export default IdeasRoutes
