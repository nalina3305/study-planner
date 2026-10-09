// Key used to save tasks in the browser
const STORAGE_KEY = "studyPlannerTasks";

const form = document.getElementById("task-form");
const nameInput = document.getElementById("task-name");
const dateInput = document.getElementById("due-date");
const nameError = document.getElementById("name-error");
const dateError = document.getElementById("date-error");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");

// Load saved tasks, or start with an empty list
let tasks = loadTasks();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const dueDate = dateInput.value;
  let isValid = true;

  nameError.textContent = "";
  dateError.textContent = "";

  if (name === "") {
    nameError.textContent = "Please enter a task name.";
    isValid = false;
  }

  if (dueDate === "") {
    dateError.textContent = "Please choose a due date.";
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    name: name,
    dueDate: dueDate,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  form.reset();
  nameInput.focus();
});

taskList.addEventListener("click", function (event) {
  const taskId = event.target.getAttribute("data-id");

  if (!taskId) {
    return;
  }

  if (event.target.classList.contains("toggle-complete")) {
    toggleTask(taskId);
  }

  if (event.target.classList.contains("btn-delete")) {
    deleteTask(taskId);
  }
});

function toggleTask(id) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  tasks.forEach(function (task) {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("completed");
    }

    const statusText = task.completed ? "Completed" : "Not completed";
    const formattedDate = formatDate(task.dueDate);

    item.innerHTML =
      '<div class="task-main">' +
      '<input type="checkbox" class="toggle-complete" data-id="' +
      task.id +
      '" ' +
      (task.completed ? "checked" : "") +
      ' aria-label="Mark ' +
      escapeHtml(task.name) +
      ' as completed" />' +
      "<div>" +
      '<p class="task-title">' +
      escapeHtml(task.name) +
      "</p>" +
      '<p class="task-date">Due: ' +
      formattedDate +
      "</p>" +
      '<p class="task-status">' +
      statusText +
      "</p>" +
      "</div>" +
      "</div>" +
      '<button type="button" class="btn btn-delete" data-id="' +
      task.id +
      '">Delete</button>';

    taskList.appendChild(item);
  });

  updateSummary();
}

function updateSummary() {
  let completed = 0;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completed += 1;
    }
  }

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;
}

function formatDate(dateString) {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    return dateString;
  }

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  return month + "/" + day + "/" + year;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    return [];
  }
}

renderTasks();
