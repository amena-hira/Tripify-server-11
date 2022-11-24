const express = require('express')
const cors = require('cors');

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

async function run(){
    
}

app.get('/', (req, res) => {
  res.send('Tipify server is running!')
})

app.listen(port, () => {
  console.log(`Tripify app listening on port ${port}`)
})