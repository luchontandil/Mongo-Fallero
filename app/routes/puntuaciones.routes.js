module.exports = (app) => {
    const puntuaciones = require('../controllers/puntuacion.controller.js');

    // Create a new puntuaciones
    app.post('/puntuaciones', puntuaciones.create);

    // Retrieve all puntuaciones
    app.get('/puntuaciones', puntuaciones.findAll);

    // Retrieve all puntuaciones dado un ip
    app.post('/puntuacionesip', puntuaciones.findAllip);

    // Retrieve a single puntuaciones with puntuacionId
    app.post('/puntuacion', puntuaciones.findOne);

    app.post('/puntuacionesFalla', puntuaciones.getPuntuaciones);


    //DELETE DE TODO LA BD
    app.delete('/puntuaciones', puntuaciones.delete);
}
