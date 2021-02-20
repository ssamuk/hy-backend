/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const app = express()
const Person = require("./models/person")

app.use(cors())
app.use(express.static("build"))
app.use(express.json())

morgan.token("type", function (req, res) { return req.headers["content-type"] })
app.use(morgan("tiny", "type"))



const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
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



app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
    .catch(error => next(error))
})

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
      response.write(`<p>${new Date()}</p>`)
      response.end()
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/*const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => n.id))
      : 0
    return maxId + 1
}*/

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  /* Pretty sure we dont need this anymore after validators
    but im still gonna let it be here for now

    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'Must contain name and number'
      })
    }
    */
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})


app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new : true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})



// Olemattomat osoitteet
//Nämä on tärkeä olla vasta lopussa.
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


// Virheelliset pyynnöt
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  //Line below was for debugging
  // console.log('Process.env: ', process.env)
  console.log(`Server running on port ${PORT}`)
})