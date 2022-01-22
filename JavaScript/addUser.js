let db = openDatabase("pharmacy", "1.1", "pharmacy system v1", 24 * 1024 * 1024);

function addUser() {
  let usName = document.getElementById("usname").value;
  let usPsw = document.getElementById("uspass").value;
  let hashPass = toMd5(usPsw);
  db.transaction(function (tx) {
    tx.executeSql("insert into users (userName, hashedPass) values (?,?)", [usName, hashPass],
    function(tx, result) {
      alert("User added successfully ✅");
    },
    function(tx, error) {
      alert("Some thing gone Wrong!");
      console.log(error);
    })
  });
}
