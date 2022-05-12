function getUsers() {

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState == XMLHttpRequest.DONE) {

            // 200 means everthing worked
            if (xhr.status === 200) {

              let data = JSON.parse(this.responseText);
              if(data.status == "success") {

                            let str = `        <tr>
<th class="id_header"><span>ID</span></th>
<th class="userName_header"><span>Username</span></th>
<th class="firstName_header"><span>First Name</span></th>
<th class="lastName_header"><span>Last Name</span></th>
<th class="email_header"><span>Email</span></th>
<th class="password_header"><span>Password</span></th>
<th class="isAdmin_header"><span>is Admin</span></th>
</tr>`;


                    for(let i = 0; i < data.rows.length; i++) {
                        let row = data.rows[i];
                        //console.log("row", row);
                        str += ("<tr><td class='id'>" + row.ID
                            + "</td><td class='userName'><span>" + row.user_name
                            + "</span></td><td class='firstName'><span>" + row.first_name
                            + "</span></td><td class='lastName'><span>" + row.last_name + "</span>"
                            + "</td><td class='email'><span>"
                            + row.email + "</span>"
                            + "</td><td class='password'><span>" + row.password 
                            + "</span></td><td class='isAdmin'><span class='adminSpan'>" + row.is_admin 
                            + "</span></tr>");
                    }
                    //console.log(str);
                    document.getElementById("customers").innerHTML = str;

                    // select all spans under the email class of td elements
                    let emailRecords = document.querySelectorAll("td[class='email'] span");
                    for(let j = 0; j < emailRecords.length; j++) {
                        emailRecords[j].addEventListener("click", editEmail);
                    }

                    // select all spans under the userName class of td elements
                    let userNameRecords = document.querySelectorAll("td[class='userName'] span");
                    for(let j = 0; j < userNameRecords.length; j++) {
                        userNameRecords[j].addEventListener("click", editUserName);
                    }

                    // select all spans under the firstName class of td elements
                    let firstNameRecords = document.querySelectorAll("td[class='firstName'] span");
                    for(let j = 0; j < firstNameRecords.length; j++) {
                        firstNameRecords[j].addEventListener("click", editFirstName);
                    }

                    // select all spans under the lastName class of td elements
                    let lastNameRecords = document.querySelectorAll("td[class='lastName'] span");
                    for(let j = 0; j < lastNameRecords.length; j++) {
                        lastNameRecords[j].addEventListener("click", editLastName);
                    }

                    // select all spans under the password class of td elements
                    let passwordRecords = document.querySelectorAll("td[class='password'] span");
                    for(let j = 0; j < passwordRecords.length; j++) {
                        passwordRecords[j].addEventListener("click", editPassword);
                    }

                    // select all spans under the isAdmin class of td elements
                    let isAdminRecords = document.querySelectorAll("td[class='isAdmin'] span");
                    for(let j = 0; j < isAdminRecords.length; j++) {
                        isAdminRecords[j].addEventListener("click", editIsAdmin);
                    }

                } else {
                    console.log("Error!");
                }

            } else {

              // not a 200, could be anything (404, 500, etc.)
              console.log(this.status);

            }

        } else {
            console.log("ERROR", this.status);
        }
    }
    xhr.open("GET", "/get-allUsers");
    xhr.send();
}
getUsers();

//admin change email
function editEmail(e) {

        // gets rid of messages
        document.getElementById("message").innerHTML = "";
        document.getElementById("status").innerHTML = "";

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            // if admin puts a value without the @
            if (v.includes("@")){
                v = input.value;
            } else {
                v = input.value;
                v.style.color = "red";
                document.getElementById("message").innerHTML = "Not a valid input.";
            }
            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editEmail);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              email: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                        // if valid input for isAdmin is made, "record updated" message will show up
                        if (document.getElementById("message").innerHTML == "Not a valid input."){
                            document.getElementById("status").innerHTML = "";
                        } else {
                            document.getElementById("status").innerHTML = "Record updated.";
                        }


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-email");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            //console.log("dataToSend", "id=" + dataToSend.id + "&email=" + dataToSend.email);
            xhr.send("id=" + dataToSend.id + "&email=" + dataToSend.email);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}

//admin change user name
function editUserName(e) {

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editUserName);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              userName: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                      document.getElementById("status").innerHTML = "Record updated.";
                      // getCustomers();


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-username");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log("dataToSend", "id=" + dataToSend.id + "&userName=" + dataToSend.userName);
            xhr.send("id=" + dataToSend.id + "&userName=" + dataToSend.userName);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}

//admin change first name
function editFirstName(e) {

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editFirstName);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              firstName: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                      document.getElementById("status").innerHTML = "Record updated.";
                      // getCustomers();


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-firstname");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log("dataToSend", "id=" + dataToSend.id + "&firstName=" + dataToSend.firstName);
            xhr.send("id=" + dataToSend.id + "&firstName=" + dataToSend.firstName);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}

//admin change last name
function editLastName(e) {

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editLastName);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              lastName: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                      document.getElementById("status").innerHTML = "Record updated.";
                      // getCustomers();


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-lastname");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log("dataToSend", "id=" + dataToSend.id + "&lastName=" + dataToSend.lastName);
            xhr.send("id=" + dataToSend.id + "&lastName=" + dataToSend.lastName);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}

//admin change password
function editPassword(e) {

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editPassword);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              password: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {
                      document.getElementById("status").innerHTML = "Record updated.";
                      // getCustomers();


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-password");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log("dataToSend", "id=" + dataToSend.id + "&password=" + dataToSend.password);
            xhr.send("id=" + dataToSend.id + "&password=" + dataToSend.password);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}

//admin change is admin status
function editIsAdmin(e) {

    // gets rid of messages
    document.getElementById("message").innerHTML = "";
    document.getElementById("status").innerHTML = "";

    // add a listener for clicking on the field to change email
    // span's text
    let spanText = e.target.innerHTML;
    // span's parent (td)
    let parent = e.target.parentNode;
    // create a new input, and add a key listener to it
    let input = document.createElement("input");
    input.value = spanText;
    input.addEventListener("keyup", function(e) {
        let s = null;
        let v = null;
        // pressed enter
        if(e.which == 13) {
            v = input.value;
            // if admin puts a value other than 1 or 0, make it 0
            if (v != 1 && v != 0){
                v = 0;
                document.getElementById("message").innerHTML = "Not a valid input.";
            }
            const button = document.querySelector('.isAdmin');

            const div = button.parentNode;

            const divparent = div.parentNode;

            var lookForOne = [];
            let isAdminRecords = document.querySelectorAll("td[class='isAdmin'] span");
            for(let j = 0; j < isAdminRecords.length; j++) {
                let i = 0;
                let isAdmin = divparent.querySelector(".isAdmin").innerHTML;
                lookForOne.push(isAdmin);
                console.log(isAdmin);
                console.log(lookForOne);
                i++;
            }
            if (lookForOne.includes("1")){
                v = v;
                console.log("there is a 1!")
                lookForOne = [];
            } else {
                v = 1;
                console.log("There is no one :(")
                lookForOne = [];
            }

            let newSpan = document.createElement("span");
            // have to wire an event listener to the new element
            newSpan.addEventListener("click", editIsAdmin);
            newSpan.innerHTML = v;
            parent.innerHTML = "";
            parent.appendChild(newSpan);
            let dataToSend = {id: parent.parentNode.querySelector(".id").innerHTML,
                              isAdmin: v};

            // now send
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (this.readyState == XMLHttpRequest.DONE) {

                    // 200 means everthing worked
                    if (xhr.status === 200) {

                        // if valid input for isAdmin is made, "record updated" message will show up
                        if (document.getElementById("message").innerHTML == "Not a valid input."){
                            document.getElementById("status").innerHTML = "";
                        } else {
                            document.getElementById("status").innerHTML = "Record updated.";
                        }
                            

                      // getCustomers();


                    } else {

                      // not a 200, could be anything (404, 500, etc.)
                      console.log(this.status);

                    }

                } else {
                    console.log("ERROR", this.status);
                }
            }
            xhr.open("POST", "/admin-update-isAdmin");
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log("dataToSend", "id=" + dataToSend.id + "&isAdmin=" + dataToSend.isAdmin);
            xhr.send("id=" + dataToSend.id + "&isAdmin=" + dataToSend.isAdmin);

        }
    });
    parent.innerHTML = "";
    parent.appendChild(input);

}