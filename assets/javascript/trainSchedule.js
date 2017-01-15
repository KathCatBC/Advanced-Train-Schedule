var provider = new firebase.auth.GithubAuthProvider();

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});

  var config = {
    apiKey: "AIzaSyBB7-HCnEi21ox3JuxWgjIHCmfFnUgPGBI",
    authDomain: "train-schedule-66db2.firebaseapp.com",
    databaseURL: "https://train-schedule-66db2.firebaseio.com",
    storageBucket: "train-schedule-66db2.appspot.com",
    messagingSenderId: "743138719065"
  };
  firebase.initializeApp(config);

  // var provider = new firebase.auth.GithubAuthProvider();
  






  var trnObject = {};
  var database = firebase.database();
  $("#editTrain").hide();

$("#addTrain-btn").on("click", function(event) {   

    var trnName = $("#trainName").val().trim();
    var trnDest = $("#trainDestination").val().trim();
    var trnStart = moment($("#trainFirstTime").val().trim(), "HH:mm").format("HH:mm");
    var trnFreq = $("#trainFrequency").val().trim();

    var newTrain = {
      route: trnName,
      dest: trnDest,
      start: trnStart,
      freq: trnFreq
    };

    database.ref().push(newTrain);

    $("#trainName").val("");
    $("#trainDestination").val("");
    $("#trainFirstTime").val("");
    $("#trainFrequency").val("");

    return false;
});


database.ref().on("child_added", function(childSnapshot, prevChildKey) {

    var trnName = childSnapshot.val().route;
    var trnDest = childSnapshot.val().dest;
    var trnStart = childSnapshot.val().start
    var trnFreq = childSnapshot.val().freq;
    var trnNext = nextTrainCalc(trnStart, trnFreq);
    var trnWait = waitTrainCalc(trnNext);    

    $("#trainTable > tbody").append("<tr><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");

});


function nextTrainCalc(firstTrain, scheduled) {

  var checkNext = moment(firstTrain,"HH:mm");
  var g = Number(scheduled);
  var trnGap = moment.duration(g, "m");

  var i = 0;

  do {
    if (checkNext.isSameOrAfter()) {  // () returns now
      return(moment(checkNext).format("HH:mm"))
    }
    checkNext.add(trnGap, "m");
  } while (i < 5);   // make an infinite loop
  
}

function waitTrainCalc(waiting) {

  var now = moment().format("HH:mm")
  var trnHr = Number(waiting.substr(0,2));
  var trnMin = Number(waiting.substr(3, 2));
  
  var now = moment().format("HH:mm")
  var nowHr = Number(now.substr(0,2));
  var nowMin = Number(now.substr(3,2));

  var waiting = (((trnHr*60) + trnMin)-((nowHr*60) + nowMin))

  return(waiting)
}


setInterval(function() {updateboard()}, 1000*60);

function updateboard(){

  $("#trainTable > tbody").empty();
  database.ref().once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {

      var trnName = childSnapshot.val().route;
      var trnDest = childSnapshot.val().dest;
      var trnStart = childSnapshot.val().start
      var trnFreq = childSnapshot.val().freq;
      var trnNext = nextTrainCalc(trnStart, trnFreq);
      var trnWait = waitTrainCalc(trnNext);    

      $("#trainTable > tbody").append("<tr><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");
    });
  });
};

// $("#editSch").on("click", function(event) {
  
//   var trnArr = [];

//   $("#addTrain").hide();
//   $("#editTrain").show();
//   $("#editSch").hide();
//    database.ref().once('value', function(snapshot) {
//     snapshot.forEach(function(childSnapshot) {
      
//       var trnKey = database.ref().child('posts').push().key;
//       var trnName = childSnapshot.val().route;
//       var trnDest = childSnapshot.val().dest;
//       var trnStart = childSnapshot.val().start;
//       var trnFreq = childSnapshot.val().freq
      
//       $('<option>').val(trnKey).text(trnName).appendTo('#trainNameEdit');
     
//       var trnKey = {};
//       var keyObj = "key": trnKey, {"route": trnName,"dest": trnDest,"start": trnStart,"freq": trnFreq}
//       trnArr.push(keyObj);
//       console.log(trnObj);

//       });

    
//     });


//       $("#trainNameEdit").on("click", function(event) {

//         var selectedKey = $("#trainNameEdit option:selected").val();
//         var selectedName = $("#trainNameEdit option:selected").text();

//         console.log("key selected = " + selectedKey);
//         console.log("name selected = " + selectedName);

//         // $("#trainName")=database.trnKey().val().route;
//         $("#trainDestination").val(database.val(selectedKey).dest);
//     // var trnStart = moment($("#trainFirstTime").val().trim(), "HH:mm").format("HH:mm");
//     // var trnFreq = $("#trainFrequency").val().trim();




// })

  // $("#addTrain").show();
  // $("#editTrain").hide();
  // $("#editSch").show();


// });