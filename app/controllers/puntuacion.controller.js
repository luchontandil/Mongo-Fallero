const Puntuacion = require('../models/puntuacion.model.js');

// Obtener todos los puntuaciones
exports.findAll = (req,res) => {

    Puntuacion.find().then(puntuaciones=>{
        res.send(puntuaciones);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras los capturabamos a todos"
        });
    });

};
//find una
exports.findOne = (req,res) => {

    Puntuacion.findOne({ idFalla: req.body.idFalla, ip: req.body.ip }).then(puntuacion=>{
        res.send(puntuacion);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras se obtenia la falla"
        });
    });
};

// find todas las puntuaciones echas por un ip
exports.findAllip = (req,res) => {
    Puntuacion.find({ ip: req.body.ip }).then(puntuaciones =>{
        res.send(puntuaciones);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras se obtenia la falla"
        });
    });

};

// Crear y salvar
exports.create = (req,res)=>{

    // Validamos el puntuacion
    if (!req.body){
        console.log(req.body);
        return res.status(400).send({
           message:"puntuacion Vacio..."
        });
    }

    const puntuacion = new Puntuacion({
        idFalla: req.body.idFalla || "idFallaVacio",
        ip: req.body.ip || "127.0.0.1",
        puntuacion: req.body.puntuacion|| -1
    })

    puntuacion.save().then(data =>{
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message|| "Something was wrong creating puntuacion"
        });
    });
};

exports.delete = (req,res) => {

    Puntuacion.remove({ip: req.body.ip , idFalla: req.body.idFalla })
    .then(data =>{
        res.send(data);
    })
    .catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras borraba"
        });
    });

};
