let db = openDatabase("pharmacy", "1.1", "pharmacy system v1", 24 * 1024 * 1024);
let video = document.querySelector("#videoElement");
let canvas = document.querySelector("#showscreenshot");


showItems();

async function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false },)
    video.srcObject = stream;
  }
}

function stopCamera(e) {
  let stream = video.srcObject;
  let tracks = stream.getTracks();
  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
}

function takeScreenshot() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
}

function addItem() {
  let itmId = document.getElementById("itm-id").value;
  let itmName = document.getElementById("itm-nm").value;
  let itmQnt = document.getElementById("itm-qnt").value;
  let imgUrl = canvas.toDataURL();

  db.transaction(function (tx) {
    tx.executeSql("insert into items (id, name, quantity, img) values (?,?,?,?)", [itmId, itmName, itmQnt, imgUrl], function (tx, result) {
      alert("Item added successfully! 😊");
    }, function (tx, err) {
      console.log(err);
    })
  });
  showItems();
}

function addInvoice() {
  let invDate = document.getElementById("inv-date").value;
  let invCus = document.getElementById("inv-cus").value;
  let invTyp = document.getElementById("inv-typ").value;
  let invItm = document.getElementById("inv-itm").value;

  if (invItm !== "") {
    let indvItem = invItm.split(", ");
    for (let i = 0; i < indvItem.length; i++) {
      let itmAndQnty = indvItem[i].split(" ");
      let itemName = itmAndQnty[0];
      let itemQnty = itmAndQnty[1];

      db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM items where name = ?", [itemName],
          function (tx, result) {
            let currentRecord = result.rows[0];
            if (invTyp === "sell") {
              tx.executeSql("update items set quantity = ? where name = ?", [(currentRecord.quantity - itemQnty), itemName])
            } else {
              tx.executeSql("update items set quantity = ? where name = ?", [(parseInt(currentRecord.quantity) + parseInt(itemQnty)), itemName])
            }
          },
          function (tx, err) {
            console.log(err);
          })
      })

      db.transaction(function (tx) {
        tx.executeSql("insert into invoices (date, customerName, type, itemsAndQuantity) values (?,?,?,?)", [invDate, invCus, invTyp, invItm], function (tx, result) {
          alert("Invoice added successfully 🧾");
        }, function (tx, err) {
          console.log(err);
        })
      })
    }
  }
  showItems();
}

function showItems() {
  db.transaction(function (tx) {
    tx.executeSql("select * from items ", null, function (tx, result) {
      let content = "";
      let imgUrl = "";
      for (let i = 0; i < result.rows.length; i++) {
        let currentRecord = result.rows[i];
        imgUrl = currentRecord.img;
        content += `
                  <br>
                  <tr>
                    <td>
                        ${currentRecord.id}
                    </td>
                      <td>
                          <b>${currentRecord.name}</b>
                      </td>
                      <td>
                          ${currentRecord.quantity}
                      </td>
                      <td>
                        <img src ="${currentRecord.img}" style="width: 50px; height: 50px;">
                      </td>
                      <td>
                          <button class="vid-but" onclick="deleteItem(${currentRecord.id})" >Delete</button>
                          <button class="vid-but" onclick='showEdit(${currentRecord.id})' >Edit</button>
                      </td>
                  </tr>
                  `
        itemsTableBody.innerHTML = content;
      }

    }, function (tx, err) {
      console.log(err);
      alert(err.message);
    })
  })
}

function deleteItem(id) {
  db.transaction(function (tx) {
    tx.executeSql("delete from items where id = ? ", [id], function (tx, result) {
      alert("Item deleted successfully!");
      showItems();
    }, function (tx, err) {
      console.log(err);
    })
  })
}

function showEdit(oldItmId) {
  let editDiv = document.getElementById('edit');
  editDiv.style.visibility = "visible";
  editDiv.innerHTML += `<button class="sub-but" type="button" onclick="startEdit(${oldItmId})">Update Item</button>`;
}

function startEdit(oldItmId) {
  let editDiv = document.getElementById('edit');
  let itmId = document.getElementById("edit-id").value;
  let itmName = document.getElementById("edit-nm").value;
  let itmQnt = document.getElementById("edit-qnt").value;

  db.transaction(function (tx) {
    tx.executeSql("update items set id = ?, name = ?, quantity = ? where id = ?", [itmId, itmName, itmQnt, oldItmId], function (tx, result) {
      alert("Item updated successfully! 😊");
      editDiv.style.visibility = "hidden";
      showItems();
    }, function (tx, err) {
      console.log(err);
    })
  });
}
