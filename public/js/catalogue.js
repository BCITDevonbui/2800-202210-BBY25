"use strict";
ready(function () {
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

  function getItems() {
    ajaxGET("/get-catalogue", function (data) {
      let parsedData = JSON.parse(data);
      console.log(`this is parsed: ${parsedData}`);
      if (parsedData.status == "success") {
        let str = `<tr>
          <th class="id_header"><span>ID</span></th>
          <th class="name_header"><span>Name</span></th>
          <th class="quantity_header"><span>Quantity</span></th>
          <th class="price_header"><span>Price</span></th>
          <th class="mostWanted_header"><span>Most Wanted</span></th>
          </tr>`;

        for (let i = 0; i < parsedData.rows.length; i++) {
          let row = parsedData.rows[i];
          console.log(`new row: ${row}`);
          str +=
            "<tr><td class='id'>" +
            row.itemID +
            "</td><td class='name'><span>" +
            row.name +
            "</span></td><td class='quantity'><span>" +
            row.quantity +
            "</span></td><td class='price'><span>" +
            row.price +
            "</span>" +
            "</td><td class='most_wanted'><span>" +
            row.most_wanted +
            "</span></td></tr>";
        }
        document.getElementById("content").innerHTML = str;
      }
    });
  }
  getItems();
});

function ready(callback) {
  if (document.readyState != "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}
