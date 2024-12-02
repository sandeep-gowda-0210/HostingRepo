const express = require('express')

const app = express()

app.use(express.json())

let todos = [{ id: 1, todo: "work" }, { id: 2, todo: "sleep" }, { id: 3, todo: "eat" }]

app.get('/', (req, res) => {
    res.status(200).json(todos);
})

app.get('/:id', (req, res) => {
    res.status(200).json(todos.find((e) => e.id === parseInt(req.params.id)));
})


app.post('/', (req, res) => {
    todos.push(req.body)
    console.log("pushed", todos);

    res.status(200).send('succesfully pushed')
})
app.listen(4000, (err) => !err ? console.log('successfully running') : console.log("error")
)