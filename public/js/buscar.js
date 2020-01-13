const fallasUrl = "http://mapas.valencia.es/lanzadera/opendata/Monumentos_falleros/JSON";
const ipURL = "https://api.ipify.org?format=json";
const serverUrl = window.location.href;
let fallas = {};
let puntuaciones = {};
let fallasEnPantalla = [];
let map;
let ip;

function getIP() {
var ip;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     // console.log(JSON.parse(this.responseText).ip);
     ip = JSON.parse(this.responseText);
    }
  };
  xhttp.open("GET", ipURL, true);
  xhttp.send();

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ip);
    }, 1000);
  });
}

function filtroLetra(elemento) {
  // let letra = document.querySelector(`input[name="calle"]`).value;
  // return elemento.properties.nombre.startsWith(letra);
  return elemento;
}

function filtroSeccion(seccion) {
  if (seccion == 'TODAS') {
    dibujar(fallas);
    fallasEnPantalla = fallas;
  } else {
    let output = [];
    fallas.forEach(item => {
      if (item.properties.seccion == seccion) {
        output.push(item);
      }
    });
    dibujar(output);
    fallasEnPantalla = output;
  }
}

function filtroAnioFuncadion(anio) {

  if (document.querySelector('#anio').value != '') {

    let output = [];
    fallasEnPantalla.forEach(item => {
      if (item.properties.anyo_fundacion >= anio) {
        output.push(item);
      }
    });
    dibujar(output);
    fallasEnPantalla = output;
  }
}

// function toUpp() {
//   document.querySelector(`input[name="calle"]`).value = document.querySelector(`input[name="calle"]`).value.toUpperCase();
// }

function buscar() {
  // console.log(document.querySelector('#seccion').value);
  filtroSeccion(document.querySelector('#seccion').value);
  filtroAnioFuncadion(document.querySelector('#anio').value);
  getPuntuaciones();
}

function getPuntuaciones() {
  data = {
    ip: `"${ip.ip}"`
  }
  fetch(`/puntuacionesip`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    res.json().then(function(data) {
      console.log(data);
      puntuaciones = data;
      puntuaciones.forEach(item => {
        let id = item.idFalla;
        let puntos = item.puntuacion;

        if (document.querySelector(`div[fallaid='${id}']`) != null) {
          ponerEstrellas(id, puntos);
          document.querySelector(`div[fallaid='${id}']`).setAttribute('puntuado', 'si');
        }
      });
    })
  });

}

function ponerEstrellas(id, puntos) {
  document.querySelectorAll(`div[fallaid='${id}'] span`).forEach(item => {
    if (item.getAttribute('idStar') <= puntos) {
      item.classList.add('checked');
    } else {
      item.classList.remove('checked');
    }
  });
}

function getFallas() {
  const fetchPromesa = fetch(fallasUrl);
  fetchPromesa.then(response => {
      return response.json();
    })
    .then(respuesta => {
      fallas = respuesta.features;
      crs = respuesta.crs.properties.name;
      // console.log(fallas);
      dibujar(fallas);
    }).then(value => {
      actualizarInputs(fallas)
      getPuntuaciones();
    });
}

function actualizarInputs(items) {
  let elementoHtml = document.querySelector("#seccion");
  let secciones = [];
  elementoHtml.innerHTML += "";

  items.forEach(item => {
    if (!secciones.includes(item.properties.seccion)) {
      secciones.push(item.properties.seccion);
    }
  });
  secciones.sort();
  secciones.unshift('TODAS');
  secciones.forEach(item => {
    elementoHtml.innerHTML += `<option>${item}</option>`;
  });

}

function dibujar(items) {
  // console.log(respuesta.features[0].properties);
  // const resultado = respuesta.features.filter(filtroLetra);
  document.querySelector('main').innerHTML = "";

  let column1 = document.createElement("div");
  column1.classList.add('column');
  let column2 = document.createElement("div");
  column2.classList.add('column');
  let column3 = document.createElement("div");
  column3.classList.add('column');
  let columns = [];
  columns[0] = column1;
  columns[1] = column2;
  columns[2] = column3;
  let i = 0;

  document.querySelector("main").innerHTML = "";
  document.querySelector("main").appendChild(column1);
  document.querySelector("main").appendChild(column2);
  document.querySelector("main").appendChild(column3);

  items.forEach(falla => {
    let item = document.createElement("div");
    item.innerHTML += `<img src='${falla.properties.boceto}'></img>`;
    item.innerHTML += `<h3 class='nombreFalla'>${falla.properties.nombre}</h3>`;
    item.innerHTML += `<div class="menuItem">
    <div class="estrellas" fallaid="${falla.properties.id}" puntuado="no">
    <span idStar="1" class="fa fa-star"></span>
    <span idStar="2" class="fa fa-star"></span>
    <span idStar="3" class="fa fa-star"></span>
    <span idStar="4" class="fa fa-star"></span>
    <span idStar="5" class="fa fa-star"></span>
    </div>
    <button id='${falla.properties.id}' coordinates='${falla.geometry.coordinates}' class="ubicationBtn">Ubicacion</button>
    </div>`;
    item.classList.add('falla');
    item.querySelector('.ubicationBtn').addEventListener("click", mostrarMapa);

    item.querySelectorAll('.estrellas span').forEach(stars => {
      stars.addEventListener("click", votar);
      stars.addEventListener("mouseover", colorear);
      // if (stars.parentNode.getAttribute("puntuado") != 'si') {
      stars.addEventListener("mouseout", restore);
      // } else {
      // stars.addEventListener("mouseout", dejarComoEstaba);
      // }
    });
    columns[i].appendChild(item);
    i++;
    if (i == 3) i = 0;
  });
}

// Restaura el estado de la puntuacion, si ya tenia puntaje lo deja como estaba
// de lo contrario lo deja sin puntos
function restore() {
  let id = this.parentNode.getAttribute('fallaid');
  // let estrellaID = this.getAttribute('idStar');

  if (this.parentNode.getAttribute("puntuado") != 'si') {
    document.querySelectorAll(`div[fallaid='${id}'] span`).forEach(item => {
      item.classList.remove('checked');
    });
  } else {
    puntuaciones.forEach(item => {
      let idpuntuacion = item.idFalla;
      if (idpuntuacion == id) {
        let puntos = item.puntuacion;
        ponerEstrellas(id, puntos);
      }
    });
  }
}

function votar() {
  let puntuado = this.parentNode.getAttribute('puntuado');
  let puntuacion = this.getAttribute('idStar');
  let id = this.parentNode.getAttribute('fallaid');
  data = {
    idFalla: id,
    puntuacion: puntuacion,
    ip: `"${ip.ip}"`
  }

  // if (puntuado == 'si') {
    //modificar
    fetch(`/puntuaciones`, {
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res =>{
      fetch(`${serverUrl}puntuaciones`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        this.parentNode.setAttribute('puntuado', 'si');
        ponerEstrellas(id, puntuacion);
        getPuntuaciones();
      });
    });
}

function matarMapa() {

  if (map && map.remove) {
    map.off();
    map.remove();
  }

}

function mostrarMapa() {
  matarMapa();
  const coordinates = this.getAttribute('coordinates').split(',');

  proj4.defs("urn:ogc:def:crs:EPSG::25830", "+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs");
  var geojson = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
    },
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:EPSG::25830"
      }
    }
  };

  map = L.map('map');
  // ...

  L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  //VALENCIA
  map.setView([39.46738, -0.37954], 13);

  L.Proj.geoJson(geojson).addTo(map);

  document.querySelector('.cajaMapa').style.opacity = '0.4';
  document.querySelector('.cajaMapa').style.zIndex = '5';
  document.querySelector('#map').style.opacity = '1';
  document.querySelector('#map').style.zIndex = '6';
  document.querySelector('body').style.overflow = 'hidden';
}

function desaparecer() {
  document.querySelector('.cajaMapa').style.opacity = '0.0';
  document.querySelector('.cajaMapa').style.zIndex = '-5';
  document.querySelector('#map').style.opacity = '0.0';
  document.querySelector('#map').style.zIndex = '-4';
  document.querySelector('body').style.overflow = 'auto';
}

function colorear() {
  let id = this.parentNode.getAttribute('fallaid');
  let estrellaID = this.getAttribute('idStar');

  document.querySelectorAll(`div[fallaid='${id}'] span`).forEach(item => {
    if (item.getAttribute('idStar') <= estrellaID) {
      item.classList.add('checked');
    } else {
      item.classList.remove('checked');
    }
  });

}

function getUnaFalla(id) {

  falla = {
    "idFalla": id,
    "ip": "127.0.0.1"
  }

  fetch(`/puntuacion`, {
    method: 'POST',
    body: JSON.stringify(falla),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    res.json().then(function(data) {
      // console.log(data);
      console.log(data.puntuacion);
    })
  });
}

async function init() {
  // Click en el boton de buscar
  document.querySelector("#buscar").addEventListener("click", buscar);
  // Texto cambia en el <input>
  // document.querySelector(`input[type="text"]`).addEventListener("input", toUpp);
  document.querySelector('.cajaMapa').addEventListener("click", desaparecer);

  document.querySelector('#seccion').addEventListener("change", buscar);


    ip = await getIP();

    getFallas();
    console.log(`'${ip.ip}'`);


  // getPuntuaciones();
  //borarTODO();
  //getUnaFalla(327);

}

// The mother of the lamb.
window.onload = init;
