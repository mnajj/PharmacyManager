seedDB();

function logIn() {
  let usName = document.getElementById("usname").value;
  let usPsw = document.getElementById("uspass").value;
  searchFor(usName, usPsw);
}

function searchFor(usName, usPass) {
  let hashedPass = toMd5(usPass);
  let db = openDatabase("pharmacy", "1.1", "pharmacy system v1", 24 * 1024 * 1024);
  db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM users WHERE userName='" + usName + "' AND hashedPass= '" + hashedPass + "'", [], function (tx, result) {
      if (result.rows.length > 0) {
        alert("User and Pass Found ✅");
        let currentRecord = result.rows[0];
        if (currentRecord.userName === 'admin') {
          location.href = "../Pages/Dashboard.html";
        } else {
          location.href = "../Pages/Index.html";
        }
      } else {
        alert("User and Pass NOT Found ❌");
      }
    });
  })
}

function seedDB() {
  let db = openDatabase("pharmacy", "1.1", "pharmacy system v1", 24 * 1024 * 1024);
  let hashinit = toMd5("123");

  db.transaction(function (tx) {
    tx.executeSql("create table if not exists users (id int primary key, userName varchar(200) UNIQUE, hashedPass varchar(200))", null, function (tx, result) {
      tx.executeSql("insert or ignore into users (userName, hashedPass) values (?,?)", ["admin", hashinit])
    }, function (tx, error) {
      console.log(error);
    });

    tx.executeSql("create table if not exists items (id int primary key, name varchar(200), quantity int, img varchar)", null, function (tx, result) { }, function (tx, error) {
      console.log(error);
    });

    tx.executeSql("create table if not exists invoices (id int primary key, date varchar(200), customerName varchar(200), type varchar(200), itemsAndQuantity varchar(200))", null, function (tx, result) { }, function (tx, error) {
      console.log(error);
    });
  });
}