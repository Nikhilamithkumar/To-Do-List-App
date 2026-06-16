const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

// ─── Safe localStorage wrapper ────────────────────────────────────────────────
const storage = {
  available: (function () {
    try {
      const key = "__storage_test__";
      localStorage.setItem(key, key);
      localStorage.removeItem(key);
      return true;
    } catch {
      return false; // Private mode, storage full, or blocked by browser
    }
  })(),

  get(key) {
    if (!this.available) return null;
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },

  set(key, value) {
    if (!this.available) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      //if memory full
    }
  },
};

function saveTasks() {
  const tasks = [...listContainer.querySelectorAll("li")].map((li) => ({
    text: li.querySelector("span").textContent,
    completed: li.classList.contains("completed"),
  }));
  storage.set("tasks", tasks);
}

function createTaskElement({ text, completed = false }) {
  const li = document.createElement("li");
  li.innerHTML = `
    <label>
      <input type="checkbox" ${completed ? "checked" : ""}>
      <span>${text}</span>
    </label>
    <span class="edit-btn">Edit</span>
    <span class="delete-btn">Delete</span>
  `;

  if (completed) li.classList.add("completed");

  const checkbox = li.querySelector("input");
  const taskSpan = li.querySelector("span");
  const editBtn  = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("click", function () {
    li.classList.toggle("completed", checkbox.checked);
    updateCounters();
    saveTasks();
  });

  editBtn.addEventListener("click", function () {
    const update = prompt("Edit task:");
    if (update === null) return; 
    if (update.trim() !== "") {
      // taskSpan.textContent = update.trim();
      li.classList.remove("completed");
      checkbox.checked = false;
      updateCounters();
      saveTasks();
    } else {
      alert("No Edit Made !!");
    }
  });

  deleteBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this task?")) {
      li.remove();
      updateCounters();
      saveTasks();
    }
  });

  return li;
}

function updateCounters() {
  completedCounter.textContent   = document.querySelectorAll(".completed").length;
  uncompletedCounter.textContent = document.querySelectorAll("li:not(.completed)").length;
}

function addTask() {
  const task = inputBox.value.trim();
  if (!task) {
    alert("Please write down a task");
    return;
  }

  const li = createTaskElement({ text: task });
  listContainer.appendChild(li);
  inputBox.value = "";
  updateCounters();
  saveTasks();
}

function loadTasks() {
  const saved = storage.get("tasks");
  if (!saved?.length) return;
  saved.forEach((task) => listContainer.appendChild(createTaskElement(task)));
  updateCounters();
}

inputBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") addTask();
});

loadTasks();