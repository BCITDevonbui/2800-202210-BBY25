"use strict";

ready(function () {
  let cartItem = [];
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
  const cardList = document.querySelectorAll(".add");
  for (let i = 0; i < cardList.length; i++) {
    cardList[i].addEventListener("click", function(e) {
      e.preventDefault;
      let itemID = i + 1;
      if(cartItem.includes(itemID)) {
        document.getElementById("errorMsg").innerHTML = `item${itemID} is already in your cart`;
      } else {
        cartItem.push(itemID);
        cartItemQuantity++;
      }
      // alert(`the itemID is: ${itemID}. the quantity selected is ${quantity}`);
      // create map instead of array for cartItem
      // let map = new Map()
      // if(cartItem[`item${itemID}`] != null || cartItem[`item${itemID}`] != undefined) {
      //   cartItem[`item${itemID}`] = quantity;
      // } else {
      //   let oldQuantity = cartItem[`item${itemID}`];
      //   cartItem[`item${itemID}`] = oldQuantity + quantity;
      // }
      
      // if(cartItem.has(itemID)) {
      //   let updatedQuantity = cartItem.get(itemID);
      //   cartItem.set(`${itemID}`, updatedQuantity + quantity);
      // } else {
      //   cartItem.set(`${itemID}`, quantity);
      // }


      document.getElementById("quantity").innerHTML = cartItemQuantity;
    });
  }

  document.getElementById("cart").addEventListener("click", function(e) {
    e.preventDefault;
    // let jsonData = {};
    // cartItem.forEach((value, key) => {
    //   jsonData[key] = value;
    // })
    // let array = Array.from(cartItem, ([id,value]) => ({id, value}));
    let queryString = {"cart": cartItem};

    // let parsedJSON = JSON.stringify(cartItem);
    // console.log(array);
    console.log(cartItem);
    ajaxPOST("/create-cart", function (data) {
      if (data) {
        let dataParsed = JSON.parse(data);
        if (dataParsed.status == "fail") {
          document.getElementsById("errorMsg").innerHTML = dataParsed.msg;
        } else {
          window.location.assign("/cart");
        }
      }
    }, queryString);

  })

});

function ready(callback) {
  if (document.readyState != "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

let button = document.querySelectorAll(".add");

button.forEach(add => {
  add.addEventListener("click", function clickButton(){
    add.style.backgroundColor = '#d4b9f7';
    add.value = 'Added to cart ✓';
  });
})