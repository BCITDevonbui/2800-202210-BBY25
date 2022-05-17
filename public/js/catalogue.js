"use strict";
ready(function () {
  let cartItemID = [];
  let cartItemQuantity = 0;
  function ajaxGET(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        callback(this.responseText);
      }
    };
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
    let params =
      typeof data == "string"
        ? data
        : Object.keys(data)
            .map(function (k) {
              return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
            })
            .join("&");

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        callback(this.responseText);
      }
    };
    xhr.open("POST", url);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }
  const cardList = document.querySelectorAll(".card");
  for (let i = 0; i < cardList.length; i++) {
    cardList[i].addEventListener("click", function(e) {
      e.preventDefault;
      if(!cartItemID.includes(i+1)) {
        cartItemID.push(i+1);
        cartItemQuantity++;
        document.getElementById("quantity").innerHTML = cartItemQuantity;
      } else {
        document.getElementById("errorMsg").innerHTML = `Item ID: ${i+1} is already in your cart!`;
        setTimeout(() => {
          document.getElementById("errorMsg").innerHTML = "";
        }, 2000);
      }
    });
  }

  document.getElementById("cart").addEventListener("click", function(e) {
    e.preventDefault;
    // sorts ID by ascending order
    cartItemID.sort((a,b) => a - b);
    console.log(cartItemID);
    window.location.assign("/cart");
  })
  
});

function ready(callback) {
  if (document.readyState != "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}
