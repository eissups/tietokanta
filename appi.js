const { Client } = require('pg');
var prompt = require("prompt");
var colors = require("colors/safe");

var userId = 0;
var petId;
var idCare;
var nextCareId;
var ts = new Date();

//luodaan Client
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


//kysytään käyttäjän id
function askId() {
    prompt.start();
    prompt.get({
    properties: {
      userId: {
        description: colors.pink("What is your id?")
      }
    }
  }, function (err, result) {
    console.log(colors.cyan("Pets : " + result.userId));
    getYourPets(result.userId);
    userId = result.userId;
    result.userId = "";
  });
}


//Haetaan käytääjän lemmikit
function getYourPets(id) {
    client.query('SELECT id_pet FROM user_owner WHERE id = ' + id, (err, res) => {
        if (!res.rows[0]) {
            console.log(colors.bold(colors.blue("\nNo pets found with id " + "'" + id + "'" + ". Would you like to add a new pet?")));
            noPets();  
        } else {
            console.log(colors.bold(colors.blue("\nYour pets: ")));
            console.table(res.rows);
            console.log("\n");
            showMain();
        }
    })
};


//Jos ei löydy lemmikksejä
function noPets() {
  prompt.start();
  prompt.get({
  properties: {
    number: {
      description: colors.pink("\n1) Add a new pet\n2) Search other pets\n3) Exit\n")
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


// Mitä halutaan tehdä. Vasta 2-kohta toimii
function showMain() {
    prompt.start();
    prompt.get({
    properties: {
      number: {
        description: colors.pink("\n1) Add a new pet\n2) Update your pet's information\n3) Search other pets\n4) Show my pet's id \n5) Exit\n")
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
    console.log(colors.bold(colors.blue("\nSee you soon!\n")));
    };
  });
}


//Pyydetään lemmikin id
function selectPet() {
  prompt.start();
  prompt.get({
  properties: {
    idPet: {
      description: colors.pink("What is your pet's id?")
    }
  }
}, function (err, result) {
  console.log(colors.cyan("Pets : " + result.idPet));
  getDetails(result.idPet);
  petId = result.idPet;
  result.idPet = "";
});
}


//Näytetään lemmikin lisätiedot
function getDetails(id) {
  client.query('SELECT id, name, born, dead, gender, species FROM pet WHERE id = ' + id, (err, res) => {
      if (!res) {
          console.log(colors.bold(colors.blue("\nNo pets found with id " + "'" + id + "'")));
          noPets();  
      } else {
          console.log(colors.bold(colors.blue("\nYour pet's basic details: ")));
          console.table(res.rows);
          console.log("\n");
          whatToDo();
      }
  })
};


//lisätään ateria
function addMeal() {
  prompt.start();
  prompt.get({
  properties: {
    food: {
      description: colors.pink("Give food.")
    },
    grams: {
      description: colors.pink("Give grams. Only numbers allowed!")
    }    
  }
}, function (err, result) {
  console.log(colors.cyan(result.food + ": " +result.grams  +" g"  ));
  idCare = isThereCare();
  mealToDataBase(result.food, result.grams, idCare);
  result.food = "";
  result.grams = "";
});
}


//Onko sopivaa care_id:tä
function isThereCare() {
  client.query('SELECT id FROM care WHERE id_pet = ' + petId + 'AND date = ' + ts, (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.blue(err + "\nDidn't work ")));
        maxCareId = getMaxCareId();
        newCare(nextCareId);  
    } else {
        console.log(colors.bold(colors.blue("\nnew care")));
        console.table(res.rows);
        console.log("\n");
        idCare = res.id; 
    }
})
}

//Haetaan maksimiId
function getMaxCareId() {

  client.query('SELECT MAX(id) FROM care' , (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.blue(err + "\nDidn't work ")));
        showMain();
    } else {
        console.log(colors.bold(colors.blue("\nSuurin käytetty id on " + res.rows[0].max)));
        console.table(res.rows);
        console.log("\n");
        maxCareId = res.rows[0].max; 
        nextCareId = res.rows[0].max + 1;
    }
})
}


// Lisätään uusi careid
function newCare(id) {
  console.log(' tulostetaan ' + nextCareId);
  client.query('INSERT INTO care (id, id_pet, date) VALUES ($1, $2, $3)', [nextCareId, petId, ts], (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.blue(err + 'caren lisäämisessä')));
        showMain();
    } else {
    console.log(colors.bold(colors.blue("\nNew care added: " + idCare + "\n")));
    whatToDo();
    }
})

}

//lisätään ateria tietokantaan
function mealToDataBase(food, grams) {
  client.query('INSERT INTO meals (id_care, time, food, g) VALUES ($1, $2, $3, $4)', [idCare, ts, food,, grams], (err, res) => {
    if (!res) {
        console.log(colors.bold(colors.blue(err)));
        showMain();
    } else {
    console.log(colors.bold(colors.blue("\nNew meal added " + food + " " + grams + " g" + "\n")));
    showMain();
    }
})

}


//mitä tehdään
function whatToDo() {
  prompt.start();
  prompt.get({
  properties: {
    number: {
      description: colors.pink("\n1) Add meal\n2) Add activity\n3) Add results\n3) Add note to health\n4) Backt\n")
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
  console.log(colors.bold(colors.blue("\nSee you soon!\n")));
  };
});
}

