let $ = document;
let registerForm = $.querySelector(".form");
let inputName = $.querySelector(".username");
let inputPass = $.querySelector(".password");
let tBodyElem = $.querySelector(".t-body");
let tHeadElem = $.querySelector(".t-head");

let db;

window.addEventListener("load", () => {
  let logindb = indexedDB.open("logindb", 21);

  logindb.addEventListener("error", (err) => {
    console.log("error open login db: ", err);
  });

  logindb.addEventListener("success", (event) => {
    console.log("success open login db :", event.target);
    db = event.target.result;
    // addToTable();
  });

  logindb.addEventListener("upgradeneeded", (event) => {
    db = event.target.result;
    console.log("upgradeneeded event: ", event);
    console.log("upgradeneeded db: ", db);

    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users", {
        keyPath: "userId",
      });
    }

    // if (db.objectStoreNames.contains("users")) {
    //   db.deleteObjectStore("users");
    // }
  });
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // if (!inputName.value.trim()) {
  //   alert("fill please");
  // }

  let newUser = {
    userId: Math.floor(Math.random() * 9999),
    userName: inputName.value,
    userPass: inputPass.value,
  };

  console.log("newUser:", newUser);

  let tx = db.transaction("users", "readwrite");

  tx.addEventListener("error", (err) => {
    console.log("request error:", err);
  });

  tx.addEventListener("complete", (event) => {
    console.log("request completed:", event);
  });

  let userStore = tx.objectStore("users");
  console.log(userStore);

  let request = userStore.add(newUser);
  // clearInput();

  request.addEventListener("error", (err) => {
    console.log("request error:", err);
  });

  request.addEventListener("success", (event) => {
    console.log("request success: ", event.target);
    clearInput();
    addToTable();
  });
});

function clearInput() {
  (inputName.value = ""), (inputPass.value = "");
}

function addToTable() {
  let tx = db.transaction("users", "readonly");
  let userStore = tx.objectStore("users");
  let request = userStore.getAll();

  request.addEventListener("success", (event) => {
    let allUsers = event.target.result;

    if (!tHeadElem.innerHTML) {
      tHeadElem.innerHTML = `<tr>
        <th>User ID</th>
        <th>Username</th>
        <th>Password</th>
        <th>Actions</th>
      </tr>`;
    }

    tBodyElem.innerHTML = "";
    tBodyElem.innerHTML = allUsers
      .map((user) => {
        return `<tr>
          <td>${user.userId}</td>
          <td>${user.userName}</td>
          <td>${user.userPass}</td>
          <td><a href='#' onclick="removeHandler(${user.userId})">Remove</a></td>
        </tr>`;
      })
      .join("");
  });
}

function removeHandler(userId) {
  event.preventDefault();

  let tx = db.transaction("users", "readwrite");
  let userStore = tx.objectStore("users");
  let request = userStore.delete(userId);

  request.addEventListener("success", (event) => {
    addToTable();
  });
}
