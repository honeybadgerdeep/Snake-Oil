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
val_local = [];

// check for cookie information when the window is loaded
window.onload = function() {
    if (document.cookie) {
        document.getElementById("cookie_information").innerHTML = "Hi " + getAttributeFromCookie(document.cookie, "username") + "!";
    } else {
        this.document.getElementById("cookie_information").innerHTML = "no cookie set";
        var name = prompt("Enter your name:");
        this.document.cookie = "username=" + name + "; path=/";        
        this.location.reload(true);
    }
}

database.ref('test/').on('value', function(snapshot) {
    values = Object.values(snapshot.val());
    for (el in values) {
        if (!val_local.includes(values[el])) {
            addItem(values[el]);
            val_local.push(values[el]);
        }
    }
});

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

// cookie parser
function getAttributeFromCookie(cookie, tag) {
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