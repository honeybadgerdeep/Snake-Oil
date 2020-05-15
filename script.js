// firebase code goes here
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBQkztAPMrfs1NHJpD0kco1CmEO5AZbYNA",
    authDomain: "example-project-580d5.firebaseapp.com",
    databaseURL: "https://example-project-580d5.firebaseio.com",
    projectId: "example-project-580d5",
    storageBucket: "example-project-580d5.appspot.com",
    messagingSenderId: "390342480610",
    appId: "1:390342480610:web:67ccbd8a2259c443bf44bb",
    measurementId: "G-E8ZVB82C99"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// reference to the game database
database = firebase.database();


// local data stuff
var val_local = [];
var personal_cookie_data = {};
var local_cookie;
// var local_cookie = "username=Matthew;player-id=-M7NUa1JOC0mgYMnLEUL;session-id=7729;game-id=-M7NU-if33pnF6XSSPJO;path=/"; // dummy local data

// check for cookie information when the window is loaded
window.onload = function() {

    // check for local memes
    if (this.location.href.includes("file://")) {
        if (local_cookie) {
            welcome_screen();
        } else {
            show_buttons();
        }
    } else {
        if (document.cookie) {
            welcome_screen();

        } else {
            show_buttons();
        }
    }
}

function test() {
    database.ref('test/').on('value', function(snapshot) {
        values = Object.values(snapshot.val());
        for (el in values) {
            if (!val_local.includes(values[el])) {
                addItem(values[el]);
                val_local.push(values[el]);
            }
        }
    });    
}

function addData() {
    // get the data from the input element
    var content = document.getElementById("data_val").value;
 
    // do something with the content
    database.ref('test/').push(content);

    // clear the content
    document.getElementById("data_val").value = "";
}

function emptyList(item) {
    document.getElementById("content_list").innerHTML = '';    
}

// then the higher order front-end functions
function addItem(item) {
    var li = document.createElement("li");
    li.innerHTML = item;
    document.getElementById("content_list").append(li);
}

// overall algorithm helper functions go here

// cookie parser code
function getAttributeFromCookie(tag) {
    var cookie;

    if (location.href.includes("file://")) {
        cookie = local_cookie;
    } else {
        cookie = document.cookie;
    }

    if (cookie) {
        var target = tag + "=";
        var chunks = decodeURIComponent(cookie).split(';');
        for (var i = 0; i < chunks.length; i++) {
            var el = chunks[i];
            while (el.charAt(0) == ' ') {
                el = el.substring(1);
            }
            if (el.indexOf(target) == 0) {
                return el.substring(target.length,el.length);
            }
        }
    }

    return "";
}

function setAttributeForCookie(attr, el) {

    if (location.href.includes("file://")) {
        var new_cookie = "";
        new_cookie += "username=" + (attr == "username" ? el : getAttributeFromCookie("username")) + ";";
        new_cookie += "player-id=" + (attr == "player-id" ? el : getAttributeFromCookie("player-id")) + ";";
        new_cookie += "session-id=" + (attr == "session-id" ? el : getAttributeFromCookie("session-id")) + ";";
        new_cookie += "game-id=" + (attr == "game-id" ? el : getAttributeFromCookie("game-id")) + ";";
        new_cookie += "path=/";
        local_cookie = new_cookie;
    } else {
        document.cookie = attr + "=" + el;
    }
}

function hide_buttons() {
    document.getElementById("joiners").style.display = "none";
}

function show_buttons() {
    document.getElementById("joiners").style.display = "block";
}

function create_new() {
    hide_buttons();
    database.ref('active_rounds').once('value').then(function(snapshot) {
        var sess_id = -1;
        if (snapshot.val()) {
            sess_id = getRandomizer(1000,99999);
            var active = Object.keys(snapshot.val());
            while (active.includes(sess_id)) {
                sess_id = getRandomizer(1000,9999);
            }
        } else {
            sess_id = getRandomizer(1000,9999);
            console.log(sess_id);
        }

        
        var game_data = {
            
        };
        
        setAttributeForCookie("session-id",sess_id);

        var game_id = database.ref('games/' + sess_id + "/").push(game_data).key;

        database.ref("active_rounds/"+sess_id).set(game_id);

        setAttributeForCookie("game-id",game_id);

        player_prompt("owner");
    });
}

function getRandomizer(bottom, top) {
    return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
}

function join() {
    hide_buttons();
    show_input("game_code","Enter Game Code");
    document.getElementById('game_code').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var game_code = document.getElementById('game_code').value;            
            if (!game_code.replace(/\s/g, '').length) {
                alert("Field cannot be empty");
            } else {
                document.getElementById('game_code').value = "";
                hide_input("game_code");
                setAttributeForCookie("session-id",game_code);
                database.ref("active_rounds/"+game_code).once("value",function(snapshot) {
                    setAttributeForCookie("game-id",snapshot.val());
                });

                player_prompt("member");
            }
        }
    });
}

function player_prompt(mode) {
    show_input("player_input","Enter Player Name");
    document.getElementById('player_input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var player_name = document.getElementById('player_input').value;
            if (!player_name.replace(/\s/g, '').length) {
                alert("Field cannot be empty");                
            } else {
                document.getElementById('player_input').value = "";
                hide_input("player_input");
                setAttributeForCookie("username",player_name);
                player_obj = {
                    "username": player_name,
                    "score": 0,
                    "card": "",
                    "role": mode,
                    "background": generateRandomColor()
                }
                var player_id = database.ref("games/"+getAttributeFromCookie("game-id")).child("players/").push(player_obj).key;
                setAttributeForCookie("player-id",player_id);
                welcome_screen();
            }
        }
    });
}

function generateRandomColor() {
    var colors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
    return colors[getRandomizer(0,colors.length - 1)];    
}

function show_input(btn, msg) {
    document.getElementById(btn).placeholder = msg;
    document.getElementById(btn).style.display = "inline-block";
    document.getElementById(btn).focus();
}

function hide_input(btn) {
    document.getElementById(btn).placeholder = "";
    document.getElementById(btn).style.display = "none";
}

function welcome_screen() {
    // check for local mode for testing
    document.getElementById("welcome_screen").style.display = "block";
    document.querySelector("#welcome_screen p:nth-child(1)").innerHTML = "Session ID: " + getAttributeFromCookie("session-id") + " (share w/ friends!)";
    document.querySelector("#welcome_screen p:nth-child(2)").innerHTML = "Welcome " + getAttributeFromCookie("username") + "!";
    data = {
        username: getAttributeFromCookie("username"),
        background: "darkorange"
    }

    database.ref('games/' + getAttributeFromCookie("game-id") + '/players/').on("value", add_player_previews);
}

function add_player_previews(snapshot) {
    // clear players
    var p = document.getElementsByClassName('player_preview');
    while (p[0]) {
        p[0].parentNode.removeChild(p[0]);
    }

    var players = Object.keys(snapshot.val());
    for (var i = 0; i < players.length; i++) {
        var preview = document.createElement("div");
        preview.classList.add("player_preview");
        preview.innerHTML = snapshot.val()[players[i]]['username'];
        preview.style.backgroundColor = snapshot.val()[players[i]]['background'];
        document.getElementById("welcome_screen").append(preview);    
    }
    if (snapshot.val(getAttributeFromCookie("player-id"))["role"]=="owner") {
        var preview = document.createElement("div");
        preview.classList.add("player_preview");
        preview.innerHTML = "Begin Game!";
        preview.style.backgroundColor = "none";
        preview.style.border = "white";
        preview.style.borderWidth = "2px";
        document.getElementById("welcome_screen").append(preview);            
    }
}
