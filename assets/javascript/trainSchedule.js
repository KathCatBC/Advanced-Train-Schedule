

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB5Bhg1V-_IWl8Irz5MNtsx_odFUCmf1So",
    authDomain: "advanced-train-schedule.firebaseapp.com",
    databaseURL: "https://advanced-train-schedule.firebaseio.com",
    storageBucket: "advanced-train-schedule.appspot.com",
    messagingSenderId: "820295676003"
  };
  firebase.initializeApp(config);

// var provider = new firebase.auth.GithubAuthProvider();

// firebase.auth().signInWithPopup(provider).then(function(result) {
//   console.log("authorization function");
//   // This gives you a GitHub Access Token. You can use it to access the GitHub API.
//   var token = result.credential.accessToken;
//   // The signed-in user info.
//   var user = result.user;
//   // ...

//   console.log("token + user = " + token + ": " + user)
// }).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;

//   console.log("error:  " + errorCode + ":  " + errorMessage);
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });



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

}   // end of nexTrainCalc

function waitTrainCalc(waiting) {

  var now = moment().format("HH:mm")
  var trnHr = Number(waiting.substr(0,2));
  var trnMin = Number(waiting.substr(3, 2));
  
  var now = moment().format("HH:mm")
  var nowHr = Number(now.substr(0,2));
  var nowMin = Number(now.substr(3,2));

  var waiting = (((trnHr*60) + trnMin)-((nowHr*60) + nowMin))

  return(waiting)
}  // end of waitTrainCalc


setInterval(function() {updateboard()}, 1000*60);  // wait a minute to update wait time

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
};  // end of updateboard


$("#editSch").on("click", function(event) {

    $("#addTrain").hide();
    $("#editTrain").show();
    $("#editSch").hide();

    database.ref().once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
      
            var trnKey = childSnapshot.key
            var trnName = childSnapshot.val().route;
    
            var option = $('<option>').val(trnKey).text(trnName);
            option.data("trainData", childSnapshot.val());
            option.appendTo('#trainNameSelect');

            console.log("train key = " + trnKey);  // these are the keys of the trains

        })  // end forEach loop - still in the once('value', function(snapshot) function
    
        $("#trainNameSelect").on("click", function(event) {    // clicked on dropdown list

            var selectedKey = $("#trainNameSelect option:selected").val();
            var selectedName = $("#trainNameSelect option:selected").text();
            var tempTrainData = $("#trainNameSelect option:selected").data("trainData");
          
            $("#trainNameEdit").val(selectedName);
            $("#trainDestinationEdit").val(tempTrainData.dest);
            $("#trainFirstTimeEdit").val(tempTrainData.start);
            $("#trainFrequencyEdit").val(tempTrainData.freq);
            
            $("#cancelEdit-btn").on("click", function(event){  // changed my mind don't want to edit

                $("#addTrain").show();
                $("#editTrain").hide();
                $("#editSch").show();

            });  // end cancelEdit

            $("#updateTrain-btn").on("click", function(event){  // changed my mind don't want to edit

              console.log("edit the train data")

              var trnName = $("#trainNameEdit").val().trim();
              var trnDest = $("#trainDestinationEdit").val().trim();
              var trnStart = moment($("#trainFirstTimeEdit").val().trim(), "HH:mm").format("HH:mm");
              var trnFreq = $("#trainFrequencyEdit").val().trim();

              var newTrain = {
                route: trnName,
                dest: trnDest,
                start: trnStart,
                freq: trnFreq
              };

            });  // end update train

            $("#deleteTrain-btn").on("click", function(event){
                console.log("delete train");
                console.log("selected Key " + selectedKey);
               

               // database.ref().on(selectedKey).remove();
               // database.ref().remove(selectedKey);
                // console.log(database().ref().child(selectedKey))
                
                //  WARNING DON'T DO THE NEXT LINES IT DELETES ALL THE DATA !!!!!!!!!!!!!!!!!!
                // database.ref(selectedKey).remove()   // don't do this is deletes all the data
                  // database.ref(selectedKey).remove()   // don't do this is deletes all the data
                   // database.ref().child(selectedKey).set(null);  // don't do this is deletes all the data
                
                  console.log ("what to delete:  " + "advanced-train-schedule/" + selectedKey);

                  // this does nothing.  if done in the console log it gets a promise
                  // but does not actually delete the data
                  database.ref("advanced-train-schedule/" + selectedKey).set(null);  
  

// code from firebase website
// var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
// starCountRef.on('value', function(snapshot) {
//   updateStarCount(postElement, snapshot.val());
// });

                // selectedKey.remove();


            });  // end of delete

        });  // end of train edit function

    });  // end of getting snapshot

}); // end of edit function