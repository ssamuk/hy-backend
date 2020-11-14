require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('type', function (req, res) { return req.headers['content-type'] })
app.use(morgan('tiny', 'type'))



const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(requestLogger)
/*
let persons = [
    
      { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
        
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
        
      },
      { 

        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
        
      },
      { 
        "id": 5,
        "name": "Siika Säkälä", 
        "number": "12345"
        
      }
]
*/



app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
})

app.get('/api/persons/info', (request, response) => {
      response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
      response.write(`<p>${new Date()}</p>`)
      response.end()
    }
)

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
  
  /*if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }*/
})
 
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})
 
/*const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => n.id))
      : 0
    return maxId + 1
}*/
  
app.post('/api/persons', (request, response) => {
    const body = request.body
    //console.log(persons)
    //console.log(body)
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'Must contain name and number' 
      })
    }
    const person = new Person({
       name: body.name,
       number: body.number
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
})
 
 app.use(unknownEndpoint)
 
const PORT = process.env.PORT 
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })