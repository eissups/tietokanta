const { Client } = require('pg');
const prompt = require("prompt");
const colors = require("colors/safe");
const { time } = require('console');

var userId;
var petId;
var idCare;
var nextCareid;
var ts = new Date();

/**
 * Luodaan Client ja muodostetaan yhteys.
 */
var client = new Client({
    user: 'elisa',
    host: '192.168.1.224',
    database: 'tjta3501',
    password: 'anni',
    port: 5432,
  })

  client
  .connect()
  .then(() => console.log('connected'))
  .then(() => askId())
  .catch(err => console.error('connection error', err.stack))


/**
 * Kysytään käyttäjältä hänen id:tään
 */
function askId() {
    prompt.start();
    prompt.get({
    properties: {
      userId: {
        description: colors.green("What is your id?")
      }
    }
  }, function (err, result) {
    console.log(colors.green("Pets : " + result.userId));
    getYourPets(result.userId);
    userId = result.userId;
    result.userId = 0;
  });
}


/** Haetaan käyttäjän lemmikit tietokannasta
 * @param {Number} id 
 */
function getYourPets(id) {
    client.query('SELECT id_pet FROM user_owner WHERE id = ' + id, (err, res) => {
        if (!res.rows[0]) {
            console.log(colors.bold(colors.cyan("\nNo pets found with id " + "'" + id + "'" + ". Would you like to add a new pet?")));
            noPets();  
        } else {
            console.log(colors.bold(colors.cyan("\nYour pets: ")));
            console.table(res.rows);
            console.log("\n");
            showMain();
        }
    })
};


/**Kysytään käyttäjältä, jolla ei ole lemmikkejä mitä haluaa tehdä. Vasta exit toimii.
 */
function noPets() {
  prompt.start();
  prompt.get({
  properties: {
    number: {
      description: colors.green("\n1) Add a new pet\n2) Search other pets\n3) Exit\n")
    }
  }
}, function (err, result) {
  if (result.number == 1) {
    addNewPet()
  };
  if (result.number == 2) {
    Search()
  };
  if (result.number == 3)  {
  client.end();
  };
});
}


/**Kysytään mitä käyttäjä haluaa tehdä seuraavaksi. 
 * Vasta "2) Update your pet's information"-kohta toimii ja sekin vain osittain. Ja exit
 */
function showMain() {
    prompt.start();
    prompt.get({
    properties: {
      number: {
        description: colors.green("\n1) Add a new pet\n2) Update your pet's information\n3) Search other pets\n4) Show my pet's id \n5) Exit\n")
      }
    }
  }, function (err, result) {
    if (result.number == 1) {
      addPet();
    };
    if (result.number == 2) {
      selectPet();
    };
    if (result.number == 3) {Search()};
    if (result.number == 4) {getYourPets(userId)};
    if (result.number == 5) {
    client.end();
    console.log(colors.bold(colors.cyan("\nSee you soon!\n")));
    };
  });
}


/**Väliaikaisesti pyydetään lemmikin id käyttäjältä.
 * Myöhemmin muutetaan niin, että omat lemmikit vaihtoehtona
 */
function selectPet() {
  prompt.start();
  prompt.get({
  properties: {
    idPet: {
      description: colors.green("What is your pet's id?")
    }
  }
}, function (err, result) {
  console.log(colors.green("Pets : " + result.idPet));
  getDetails(result.idPet);
  petId = result.idPet;
  result.idPet = "";
});
}


/**Haetaan lemmikin kaikki tiedot käyttäjälle
 * @param {Number} id lemmikin id
 */
function getDetails(id) {
  client.query('SELECT id, name, born, dead, gender, species FROM pet WHERE id = ' + id, (err, res) => {
      if (!res) {
          console.log(colors.bold(colors.cyan("\nNo pets found with id " + "'" + id + "'")));
          noPets();  
      } else {
          console.log(colors.bold(colors.cyan("\nYour pet's basic details: ")));
          console.table(res.rows);
          console.log("\n");
          whatToDo();
      }
  })
};


/**Kysytään käyttäjältä mitä halutaan tehdä. Vasta "1) Add meal"-kohta toimii.
 */ 
function whatToDo() {
  prompt.start();
  prompt.get({
  properties: {
    number: {
      description: colors.green("\n1) Add meal\n2) Add activity\n3) Add results\n3) Add note to health\n4) Backt\n")
    }
  }
}, function (err, result) {
  if (result.number == 1) {
    addMeal();
  };
  if (result.number == 2) {
    addActivity();
  };
  if (result.number == 3) {
    addResults()}
  ; 
  if (result.number == 3) {
    addHealth()}
  ;   
  if (result.number == 4) {
  client.end();
  console.log(colors.bold(colors.cyan("\nSee you soon!\n")));
  };
});
}


/**Pyydetään käyttäjältä ruuan numu ja määrä grammoina lisäystä varten
 */
function addMeal() {
  prompt.start();
  prompt.get({
  properties: {
    food: {
      description: colors.green("Give food.")
    },
    grams: {
      description: colors.green("Give grams. Only numbers allowed!")
    }    
  }
}, function (err, result) {
  console.log(colors.green(result.food + ": " +result.grams  +" g"  ));
  let careBool = isThereCare();
  if (careBool != true) {
    getnextCareid("food", result.food, result.grams);
  }
  else {
    mealToDataBase(result.food, result.grams);
  }
  result.food = "";
  result.grams = "";
});
}

function addActivity() {
  prompt.start();
  prompt.get({
    properties: {
      activity: {
        description: colors.green("Give activity.")
      },
      time: {
        description: colors.green("Give time: HH:MM XM ")
      }    
    }
  }, function(err, result) {
    console.log(colors.green(result.time + ": " +result.activity  +""  ));
  let careBool = isThereCare();
  if (careBool != true) {
    getnextCareid("activity", result.time, result.activity);
  }
  else {
    activityToDataBase(result.time, result.activity);
  }
  result.activity = "";
  result.time = "";
  });
}


/**Ei toimi vielä, joten tässä vaiheessa turha, koska antaa aina virheen
 * Tulevaisuudessa testataan löytyykö tietokannasta id:tä tietylle päivälle
 * ja lemmikille vai lisätäänkö uusi
 */
function isThereCare() {
  j = parseInt(petId);
  client.query('SELECT id, id_pet, date FROM care WHERE id_pet = ' + petId + 'AND date = ' + ts, (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.cyan(err + "\nDidnt find care id")));
        return false;
    } else {
        console.log(colors.bold(colors.cyan("\nCare found")));
        console.table(res.rows);
        console.log("\n");
        idCare = res.id; 
        return true;
    }
})
}


/**Väliaikainen ratkaisu
 * Etsitään suurin käytetty id ja otetaan sitä suurempi seuraavaan
 * @param {String} food ruoka ohikulkumatkalle meal:n lisäystä varten
 * @param {Number} grams määrä ohikulkumatkalle meal:n lisäystä varten
 */
function getnextCareid(careType, x, y) {
 
  client.query('SELECT MAX(id) FROM care' , (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.cyan(err + "\nDidn't work ")));
        showMain();
    }
    else {
        console.log(colors.bold(colors.cyan("\nSuurin käytetty id on " + res.rows[0].max)))
        console.table(res.rows);
        console.log("\n");
        maxCareId = res.rows[0].max; 
        nextCareid = res.rows[0].max + 1;
        newCare(careType, x, y); 
        return;
    }
 })
}


/**Lisätään uusi aika-lemmikki yhdistelmä
 * @param {String} food ruoka menossa lisäykseen
 * @param {Number} rgrams grammat menossa lisäykseen
 */
function newCare(careType, x, y) {
  const query = {
    text: 'INSERT INTO care (id, id_pet, date) VALUES ($1, $2, $3)',
    values: [nextCareid, petId, ts],
  }
    client.query(query, (err, res) => {
      if (!res) {
          console.log(colors.bold(colors.cyan(err + 'caren lisäämisessä, id: ' + nextCareid + ' ' + petId)));
          showMain();
      } else {
      idCare = nextCareid;
      if (careType == "food") {
        mealToDataBase(x, y);
      }
      else if (careType == "activity") {

        activityToDataBase(x, y)
      }
      
      console.log(colors.bold(colors.cyan("\nNew care added: " + idCare + "\n")));
      return;
      }
    })
}


/**Lisätään meal
 * @param {String} food food ruoka joka lisätään
 * @param {*} grams määrä grammoina
 */
function mealToDataBase(food, grams) {
  client.query('INSERT INTO meals (id_care, time, food, g) VALUES ($1, $2, $3, $4)', [idCare, ts, food, grams], (err, res) => {
    if (!res) {
        console.log(err);
        showMain();
    } else {
    console.log(colors.bold(colors.cyan("\nNew meal added: " + food + " " + grams + "\n")));
    showMain();
    }
})
}


function activityToDataBase(time, activity) {
  client.query('INSERT INTO activity (id_care,  activity_name, time) VALUES ($1, $2, $3)', [idCare, activity, time], (err, res) => {
    if (!res) {  
        console.log(err);
        showMain();
    } else {
    console.log(colors.bold(colors.cyan("\nNew activity added: " + time + " " + activity + " g" + "\n")));
    showMain();
    }
})


}