
const express = require('express')
const bodyParser = require('body-parser')
const pool = require('./db')
const redis = require('redis');

const app = express()
const jsonParser = bodyParser.json()

const redisClient = redis.createClient({
    host: 'redis',
    port: 6379
  });

app.get('/', async (req, res) => {
    redisClient.get('stuff' , async (error, stuff) => {
        if (error ) console.error(error)
        if (stuff != null){
            res.send(JSON.parse(stuff))
        } else {
            try{
                const data = await pool.query("SELECT * FROM morefields")
                res.send(data.rows)
                redisClient.set('stuff', JSON.stringify(data.rows))
            } catch {
                res.status(500).send('Error Occurs')
            }
    
        }
    })
})

app.post('/', jsonParser, async (req, res) => {
    try {
        await pool.query("INSERT INTO schools (name, address) VALUES ($1,$2)",[req.body.name, req.body.address])
        res.status(201).send("Data Inserted")
    } catch (error) {
        res.status(500).send('Error Occurs')
    }
})

app.get('/setup', async (req, res) => {
    try{
        await pool.query("CREATE TABLE schools( id SERIAL PRIMARY KEY, name VARCHAR(100), address VARCHAR(100) )")
        res.send('DB Created')
    }catch(error){
        res.status(500).send('Error occurs')
    }
})



app.get('/redis', function(req, res) {
    redisClient.get('numVisits', function(err, numVisits) {
        numVisitsToDisplay = parseInt(numVisits) + 1;
        if (isNaN(numVisitsToDisplay)) {
            numVisitsToDisplay = 1;
        }
        res.send('Number of visits is: ' + numVisitsToDisplay);
        numVisits++;
        redisClient.set('numVisits', numVisits);
    });
});


app.listen(3000, (req, res) => {
    console.log("Running at 3000")
})