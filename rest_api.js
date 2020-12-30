function init(collectionName,urlServer,schemaParam)
{
    const mongoose=require("mongoose")
    mongoose.connect(urlServer, {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false});  

    const db = mongoose.connection;
    db.on('error', function(){
        console.log("xxx Error when connecting to database xxx")
    });
    db.once('open', function() {
    // we're connected!
    console.log("Connected to database ------")
    }); 
    
    var express = require('express')
    var router = express.Router()

    router.use(function timeLog (req, res, next) {
        console.log('Time: ', Date.now())
        next()
    })

    const schema = new mongoose.Schema(schemaParam);
    const model = mongoose.model(collectionName, schema);
    
    // webservice d'ajout d'un document
    router.post('/', function (req, res) {
        const document = new model(req.body);
        document.save(function (err) {
            if (err) {
                console.log("erreur d'ajout d'un document.")
            };
            console.log("l'ajout d'un document est réussi.")
        });
        res.send(`document added to ${collectionName} collection`)
    })

    //Getting all 
    router.get('/', async (req, res) => {

        try {
            const allObjects = await model.find()
            res.json(allObjects);

        } catch (error) {
            res.status(500).json({message : error.message});
        }
    });

    // webservice de recherche d'un document par id
    router.get('/', function (req, res) {
        model.find(function(err,response){
            if(err){
                res.send("erreur dans getAll")
            }else{
                res.send(response)
            }
        });
    })

    // webservice d'update d'un document
    router.put('/:id', async function (req, res) {

        let id=req.params.id
        const filter = { _id: id };
        const updateObject = req.body;

        console.log(id)
        console.log(filter)
        console.log(updateObject)

        try{
            let updatedObject=await model.findOneAndUpdate(filter, updateObject)
            return res.status(200).send(updatedObject)
        }catch(err){
            return res.status(500).send(err)
        }

    })

    // webservice de suppression d'un document selon un id
    router.delete('/:id' , async (req, res) => {

        let id=req.params.id
        const filter = { _id: id };

        model.findOneAndDelete(filter, function (error, docs) { 
            if (error){ 
                return res.status(500).json({message:error});
            } 
            else{ 
                return res.status(200).json({message:docs});
            } 
        }); 
    });

    // recuperer tous les document d'une collection
    router.get('/:id', function (req, res) {
        //res.send(`id = ${req.params.id} collection`)
        model.find({_id: req.params.id},function(err,response){
            if(err){
                res.send("erreur dans getbyid")
            }else{
                res.send(response[0])
            }
        });
    })

    return router 
}

module.exports = init