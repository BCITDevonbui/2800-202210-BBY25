ready(function () {

  function ajaxGET(url, callback) {

      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
          if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
              callback(this.responseText);

          }
      }
      xhr.open("GET", url);
      xhr.send();
  }

  function ajaxPOST(url, callback, data) {

      /*
       * - Keys method of the object class returns an array of all of the keys for an object
       * - The map method of the array type returns a new array with the values of the old array
       *   and allows a callback function to perform an action on each key
       *   The join method of the arra type accepts an array and creates a string based on the values
       *   of the array, using '&' we are specifying the delimiter
       * - The encodeURIComponent function escapes a string so that non-valid characters are replaced
       *   for a URL (e.g., space character, ampersand, less than symbol, etc.)
       *
       *
       * References:
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
       */
      let params = typeof data == 'string' ? data : Object.keys(data).map(
          function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
      ).join('&');

      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
          if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
              callback(this.responseText);

          }
      }
      xhr.open("POST", url);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(params);
  }

  // change user first name
let firstNameRecords = document.getElementById("first_name");

firstNameRecords.addEventListener("click", editName);

    function editName(e) {

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
                newSpan.addEventListener("click", editName);
                newSpan.innerHTML = v;
                parent.innerHTML = "";
                parent.appendChild(newSpan);

                console.log(parent.parentNode.querySelector("#id").innerHTML);

                let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                                  name: v};

              ajaxPOST("/update-firstName", function(e) {
                e.preventDefault();
                if (data) {
                  let dataParsed = JSON.parse(data);
                  if (dataParsed.status == "fail") {
                      document.getElementById("errorMsg").innerHTML = dataParsed.msg;
                  } else {
                      window.location.replace("/account");
                  }
              }
          }, dataToSend);
            }
        });
        parent.innerHTML = "";
        parent.appendChild(input);

    }

});

function ready(callback) {
  if (document.readyState != "loading") {
      callback();
  } else {
      document.addEventListener("DOMContentLoaded", callback);
  }
}



//Change user last name
    let lastNameRecords = document.getElementById("last_name");

    lastNameRecords.addEventListener("click", editlastName);

    function editlastName(e) {

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
                newSpan.addEventListener("click", editlastName);
                newSpan.innerHTML = v;
                parent.innerHTML = "";
                parent.appendChild(newSpan);

                console.log(parent.parentNode.querySelector("#id").innerHTML);

                let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                                  lastName: v};

                // now send
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.readyState == XMLHttpRequest.DONE) {

                        // 200 means everthing worked
                        if (xhr.status === 200) {
                          document.getElementById("status").innerHTML = "Record updated.";
                        //   getCustomers();


                        } else {

                          // not a 200, could be anything (404, 500, etc.)
                          console.log(this.status);

                        }

                    } else {
                        console.log("ERROR", this.status);
                    }
                }
                xhr.open("POST", "/update-lastName");
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                console.log("dataToSend", "id=" + dataToSend.id + "&lastName=" + dataToSend.lastName);
                xhr.send("id=" + dataToSend.id + "&lastName=" + dataToSend.lastName);


            }
        });
        parent.innerHTML = "";
        parent.appendChild(input);

    }

// change user email
    let emailRecords = document.getElementById("email");

    emailRecords.addEventListener("click", editEmail);

    function editEmail(e) {

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
                newSpan.addEventListener("click", editEmail);
                newSpan.innerHTML = v;
                parent.innerHTML = "";
                parent.appendChild(newSpan);

                console.log(parent.parentNode.querySelector("#id").innerHTML);

                let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                                  email: v};

                // now send
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.readyState == XMLHttpRequest.DONE) {

                        // 200 means everthing worked
                        if (xhr.status === 200) {
                          document.getElementById("status").innerHTML = "Record updated.";
                        //   getCustomers();


                        } else {

                          // not a 200, could be anything (404, 500, etc.)
                          console.log(this.status);

                        }

                    } else {
                        console.log("ERROR", this.status);
                    }
                }
                xhr.open("POST", "/update-email");
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                console.log("dataToSend", "id=" + dataToSend.id + "&email=" + dataToSend.email);
                xhr.send("id=" + dataToSend.id + "&email=" + dataToSend.email);


            }
        });
        parent.innerHTML = "";
        parent.appendChild(input);

    }

// change user password
    let passwordRecords = document.getElementById("password");

    passwordRecords.addEventListener("click", editPassword);

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

                console.log(parent.parentNode.querySelector("#id").innerHTML);

                let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                                  password: v};

                // now send
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.readyState == XMLHttpRequest.DONE) {

                        // 200 means everthing worked
                        if (xhr.status === 200) {
                          document.getElementById("status").innerHTML = "Record updated.";
                        //   getCustomers();


                        } else {

                          // not a 200, could be anything (404, 500, etc.)
                          console.log(this.status);

                        }

                    } else {
                        console.log("ERROR", this.status);
                    }
                }
                xhr.open("POST", "/update-password");
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                console.log("dataToSend", "id=" + dataToSend.id + "&password=" + dataToSend.password);
                xhr.send("id=" + dataToSend.id + "&password=" + dataToSend.password);


            }
        });
        parent.innerHTML = "";
        parent.appendChild(input);

    }

    // change user profile pic name
    // got help with how to get the file name from:
    // https://thewebdev.info/2022/02/16/how-to-get-the-filename-from-a-file-input-with-javascript/

    const input = document.querySelector("input")
input.onchange = (e) => {
  const [file] = e.target.files
  let parent = e.target.parentNode;
  console.log(file.name)
  let v = "/img/" + file.name;
  let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                    profilePic: v};
  console.log("im the id " + dataToSend.id);
  console.log("Im the pic to be sent " + dataToSend.profilePic);
}


let profilePicRecords = document.getElementById("profilePicture");

firstNameRecords.addEventListener("click", editPic);

    function editPic(e) {

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
                newSpan.addEventListener("click", editPic);
                newSpan.innerHTML = v;
                parent.innerHTML = "";
                parent.appendChild(newSpan);

                console.log(parent.parentNode.querySelector("#id").innerHTML);

                let dataToSend = {id: parent.parentNode.querySelector("#id").innerHTML,
                                  name: v};

                // now send
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (this.readyState == XMLHttpRequest.DONE) {

                        // 200 means everthing worked
                        if (xhr.status === 200) {
                          document.getElementById("status").innerHTML = "Record updated.";
                        //   getCustomers();


                        } else {

                          // not a 200, could be anything (404, 500, etc.)
                          console.log(this.status);

                        }

                    } else {
                        console.log("ERROR", this.status);
                    }
                }
                xhr.open("POST", "/update-firstName");
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                console.log("dataToSend", "id=" + dataToSend.id + "&name=" + dataToSend.name);
                xhr.send("id=" + dataToSend.id + "&name=" + dataToSend.name);
                
                //get updated name
                localStorage.setItem("firstName", dataToSend.name);

            }
        });
        parent.innerHTML = "";
        parent.appendChild(input);

    }