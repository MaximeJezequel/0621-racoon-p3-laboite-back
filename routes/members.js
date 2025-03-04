const membersRouter = require('express').Router()
const Member = require('../models/member')
const { verifyToken } = require('../helpers/Jwt')

membersRouter.get('/', (req, res) => {
  Member.getInfo()
    .then(members => {
      res.json(members)
    })

    .catch(err => {
      console.log(err)
      res
        .status(500)
        .json({ message: 'Error retrieving team member from database' })
    })
})

membersRouter.get('/:id', (req, res) => {
  const member_id = req.params.id
  Member.findOne(member_id)
    .then(member => {
      if (!member) {
        res.status(404).json({ message: `Member not found` })
      } else {
        res.status(200).json(member)
      }
    })
    .catch(err => {
      console.log(err)
      res
        .status(500)
        .json({ message: 'Error retrieving team member from database' })
    })
})

membersRouter.post('/', verifyToken, (req, res) => {
  const { member_name } = req.body
  if (!member_name) res.status(401).json({ message: 'Name is required' })
  else {
    Member.findOneWithName(member_name).then(user => {
      if (user) {
        res.status(401).json({ message: `Member already exists` })
      } else {
        const { member_img, member_name, member_role } = req.body
        Member.create(member_img, member_name, member_role)
          .then(createdTeam => {
            res
              .status(201)
              .json({ message: 'Member Created !', member: createdTeam })
          })
          .catch(err => {
            console.error(err)
            res.status(500).json({ message: `Error saving the member` })
          })
      }
    })
  }
})

membersRouter.put('/:id', verifyToken, (req, res) => {
  const member_id = req.params.id
  let validationErrors = null
  Member.findOne(member_id)
    .then(member => {
      if (!member) {
        res
          .status(404)
          .json({ message: `Member with id ${member_id} not found.` })
      }
      validationErrors = Member.validate(req.body, false)
      if (validationErrors) {
        res.status(422).json({ validationErrors: validationErrors.details })
      } else {
        Member.update(member_id, req.body)
      }
    })
    .then(() => {
      res
        .status(200)
        .json({ message: 'Member updated !', member: { ...req.body } })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Error updating a member.' })
    })
})

membersRouter.delete('/:id', verifyToken, (req, res) => {
  const member_id = req.params.id
  Member.destroy(member_id)
    .then(deleted => {
      if (deleted) res.status(200).json({ message: `🎉 Member deleted!` })
      else res.status(404).json({ message: `Member not found` })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ message: `Error deleting a Member` })
    })
})

module.exports = membersRouter
