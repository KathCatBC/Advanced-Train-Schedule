  // Initialize Firebase

var config = {
    apiKey: "AIzaSyB5Bhg1V-_IWl8Irz5MNtsx_odFUCmf1So",
    authDomain: "advanced-train-schedule.firebaseapp.com",
    databaseURL: "https://advanced-train-schedule.firebaseio.com",
    storageBucket: "advanced-train-schedule.appspot.com",
    messagingSenderId: "820295676003"
};

firebase.initializeApp(config);

$(".schedule-panel").hide();
$("#addTrain").hide();
$("#editTrain").hide();
$("#msgModal").hide();
$("#msgModal-ok").hide();
$(".logout-panel").hide();


$("#sign-in-btn").on("click", function(event) {
    const txtEmail = $("#inputEmail").val();
    const txtPass = $("#inputPassword").val();
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(txtEmail, txtPass);
    promise.catch(e => {
        $("#modal-message-ok").text(e.message);
        $("#msgModal-ok").modal("show");
    });
});   
;

$("#sign-up-btn").on("click", function(event) {
    const txtEmail = $("#inputEmail").val();
    const txtPass = $("#inputPassword").val();
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(txtEmail, txtPass);
    promise.catch(e => {
        $("#modal-message-ok").text(e.message);
        $("#msgModal-ok").modal("show");
    });
});


$("#sign-out-btn").on("click", function(event) {
    firebase.auth().signOut();
    $("#log-in-panel").show()
    $("#inputEmail").val("");
    $("#inputPassword").val("");
    $("#sign-in-btn").show();
    $("#sign-up-btn").show();
    $(".schedule-panel").hide();
    $("#addTrain").hide();
    $("#editTrain").hide();
    $("#modal-message-ok").text("Log out successful.")
    $("#msgModal-ok").modal("show");

})      


firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        $("#sign-up-btn").hide();
        $("#sign-in-btn").hide();
        $(".schedule-panel").show();
        $("#addTrain").show();
        $("#log-in-panel").hide();
        $("#modal-message-ok").text("You have successfully logged in.")
        $("#msgModal-ok").modal("show");
        $("#sign-out-btn").show();
        $(".logout-panel").show();
    } else {
        console.log("is this all handled in the logout?")
    }
})


var trnObject = {};
var database = firebase.database();


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
});  // end add train


database.ref().on("child_added", function(childSnapshot, prevChildKey) {

    var trnName = childSnapshot.val().route;
    var trnDest = childSnapshot.val().dest;
    var trnStart = childSnapshot.val().start
    var trnFreq = childSnapshot.val().freq;
    var trnNext = nextTrainCalc(trnStart, trnFreq);
    var trnWait = waitTrainCalc(trnNext);
    var trnKey = [childSnapshot.key, trnName, trnDest, trnFreq, trnStart]    

    $("#trainTable > tbody").append("<tr><td>" + '<a href="#" class="btn btn-primary btn-sm btn-edit" id=' + trnKey + '></a>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");

    $(".btn-edit").on("click", function() { 
        var editTrainParam = $(this).context.id
        editsch(editTrainParam) 
    });
});    // end child added function


function nextTrainCalc(firstTrain, scheduled) {

    var checkNext = moment(firstTrain,"HH:mm");
    var g = Number(scheduled);
    var trnGap = moment.duration(g, "m");

    var i = 0;

    do {
        if (checkNext.isSameOrAfter()) {  // () returns now
            return(moment(checkNext).format("HH:mm"))
        } checkNext.add(trnGap, "m");

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
            var trnKey = [childSnapshot.key, trnName, trnDest, trnFreq, trnStart]   

            $("#trainTable > tbody").append("<tr><td>" + '<a href="#" class="btn btn-primary btn-sm btn-edit" id=' + trnKey + '></a>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");
        });
    });

    $(".btn-edit").on("click", function() { 
        var editTrainParam = $(this).context.id;
        editsch(editTrainParam) ;
    });

};  // end of updateboard


function editsch(keyStuff) {

    var tempTrain = keyStuff.split(",")
   
    $("#addTrain").hide();
    $("#editTrain").show();
    $("#trainNameEdit").val(tempTrain[1])
    $("#trainDestinationEdit").val(tempTrain[2]);
    $("#trainFirstTimeEdit").val(tempTrain[4]);
    $("#trainFrequencyEdit").val(tempTrain[3]);
    selectedKey = tempTrain[0]
                    
    $("#cancelEdit-btn").on("click", function(event) {  // changed my mind don't want to edit
        cleanupeditdiv();  
    });  // end cancelEdit


    $("#updateTrain-btn").on("click", function(event) { 
        
        var trnName = $("#trainNameEdit").val().trim();
        var trnDest = $("#trainDestinationEdit").val().trim();
        var trnStart = moment($("#trainFirstTimeEdit").val().trim(), "HH:mm").format("HH:mm");
        var trnFreq = $("#trainFrequencyEdit").val().trim();

        firebase.database().ref(selectedKey).set({
            route: trnName,
            dest: trnDest,
            start: trnStart,
            freq: trnFreq
        });

        updateboard()
        cleanupeditdiv()

    });  // end update train


    $("#deleteTrain-btn").on("click", function(event) {     
        $("#yes-btn").show();
        $("#no-btn").show()
        $("#modal-message").text("Are you sure you want to delete train " + tempTrain[1] +"?");
        $("#msgModal").modal("show");

        $("#yes-btn").on("click", function(event) {
            database.ref().child(selectedKey).remove(); 
            updateboard();
            cleanupeditdiv();
        });
   
    });  // end of delete train on click event

  }  // end of train edit function

  function cleanupeditdiv () {  // empty the edit fields and hide the div
    $("#trainNameEdit").val("")
    $("#trainDestinationEdit").val("");
    $("#trainFirstTimeEdit").val("");
    $("#trainFrequencyEdit").val("");
    $("#addTrain").show();
    $("#editTrain").hide();
  }