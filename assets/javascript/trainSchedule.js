

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB5Bhg1V-_IWl8Irz5MNtsx_odFUCmf1So",
    authDomain: "advanced-train-schedule.firebaseapp.com",
    databaseURL: "https://advanced-train-schedule.firebaseio.com",
    storageBucket: "advanced-train-schedule.appspot.com",
    messagingSenderId: "820295676003"
  };
  firebase.initializeApp(config);


var trnObject = {};
var database = firebase.database();
$("#editTrain").hide();
$("#msgModal").hide();
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
    var trnKey = [childSnapshot.key, trnName, trnDest, trnFreq, trnStart]    


    // try to stick more info behind the button (name dest start & freq)  copy code from github
    // <a href="#" class="btn btn-primary btn-xs btnedit"><span "fa fa-pencil"></span></a>

    $("#trainTable > tbody").append("<tr><td>" + '<a href="#" class="btn btn-primary btn-sm btn-edit" id=' + trnKey + '></a>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");

    $(".btn-edit").on("click", function() { 
      var editTrainParam = $(this).context.id
      console.log("pencil");
      // console.log($(this));
      console.log(editTrainParam);
      editsch(editTrainParam)
     

      // if this works call the real function to edit trains
      // if this does not work try document ready.
    });


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
      var trnKey = [childSnapshot.key, trnName, trnDest, trnFreq, trnStart]   


      // $("#trainTable > tbody").append("<tr><td>" + '<button class="fa fa-pencil fa-action editbtn" id=' + trnKey + '></button>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");
      // $("#trainTable > tbody").append("<tr><td>" + '<button class="fa fa-pencil fa-action editbtn" id=' + trnKey + '></button>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");
      $("#trainTable > tbody").append("<tr><td>" + '<a href="#" class="btn btn-primary btn-sm btn-edit" id=' + trnKey + '></a>' + "</td><td>" + trnName + "</td><td>" + trnDest + "</td><td>" + trnStart + "</td><td>" + trnFreq + "</td><td>" + trnNext + "</td><td>" + trnWait + "</td></tr>");
    });
  });

   $(".btn-edit").on("click", function() { 
      var editTrainParam = $(this).context.id
      console.log("pencil");
      // console.log($(this));
      console.log(editTrainParam);
      editsch(editTrainParam)
     

      // if this works call the real function to edit trains
      // if this does not work try document ready.
    });
};  // end of updateboard

// '<i class="fa fa-pencil"></i>'

 

    // $('#traintable').find('tr').click( function(){
//     var row = $(this).find('td:first').text();
//     alert('You clicked ' + row);
// });
//   // });


// $('#trainTable').find('tr').click( function(){
//   alert('You clicked row '+ ($(this).index()+1) );
// });


 // nearbyPlace.append('<span class="fa fa-bed fa-fw fa-action" style="font-size:18px"></span>')


 $(".fa-action").on("click", function(event) { 
  console.log("pencil")
});


function editsch(keyStuff) {

    
    var tempTrain = keyStuff.split(",")
   
    $("#addTrain").hide();
    $("#editTrain").show();
    $("#trainNameEdit").val(tempTrain[1])
    $("#trainDestinationEdit").val(tempTrain[2]);
    $("#trainFirstTimeEdit").val(tempTrain[4]);
    $("#trainFrequencyEdit").val(tempTrain[3]);
    selectedKey = tempTrain[0]

    // populate name, dest, freq, start in div
                    
    $("#cancelEdit-btn").on("click", function(event) {  // changed my mind don't want to edit
        // empty name, dest, freq, start in div
        // hide what you need to hide
        // show what you need to show

                $("#addTrain").show();
                $("#editTrain").hide();
                $("#editSch").show();

      });  // end cancelEdit

            // $("#updateTrain-btn").on("click", function(event){  

            //   console.log("edit the train data")

            //   var trnName = $("#trainNameEdit").val().trim();
            //   var trnDest = $("#trainDestinationEdit").val().trim();
            //   var trnStart = moment($("#trainFirstTimeEdit").val().trim(), "HH:mm").format("HH:mm");
            //   var trnFreq = $("#trainFrequencyEdit").val().trim();

            //   var newTrain = {
            //     route: trnName,
            //     dest: trnDest,
            //     start: trnStart,
            //     freq: trnFreq
            //   };

            // });  // end update train

            $("#deleteTrain-btn").on("click", function(event) {
                console.log("delete train");
                console.log("selected Key " + selectedKey);
      
                $("#modal-message").text("Are you sure you want to delete train " + tempTrain[1] +"?")
                $("#msgModal").modal("show");

                $("#yes-btn").on("click", function(event) {
                  database.ref().child(selectedKey).remove(); 
                  $("#trainNameEdit").val("");
                  $("#trainDestinationEdit").val("");
                  $("#trainFirstTimeEdit").val("");
                  $("#trainFrequencyEdit").val("");
                  updateboard()
                });

    
              })  // end of delete train on click event
    

        };  // end of train edit function