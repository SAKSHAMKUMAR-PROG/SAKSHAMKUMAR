const authPanel = document.querySelector("#authPanel");
const todoPanel = document.querySelector("#todoPanel");
const authForm = document.querySelector("#authForm");
const registerBtn = document.querySelector("#registerBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const todoForm = document.querySelector("#todoForm");
const todoTitle = document.querySelector("#todoTitle");
const todoList = document.querySelector("#todoList");
const authMessage = document.querySelector("#authMessage");
const todoMessage = document.querySelector("#todoMessage");
const filterButtons = [...document.querySelectorAll(".filter")];

let token = localStorage.getItem("todo-token") || "";
let todos = [];
let currentFilter = "all";

function setMessage(target, text) {
  target.textContent = text || "";
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong");
  }

  return data;
}

function showTodos() {
  authPanel.classList.add("hidden");
  todoPanel.classList.remove("hidden");
}

function showAuth() {
  todoPanel.classList.add("hidden");
  authPanel.classList.remove("hidden");
}

function visibleTodos() {
  if (currentFilter === "open") return todos.filter((todo) => !todo.completed);
  if (currentFilter === "done") return todos.filter((todo) => todo.completed);
  return todos;
}

function renderTodos() {
  const items = visibleTodos();
  todoList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "todo-item";
    empty.innerHTML = `<span></span><span class="todo-title">No tasks here yet.</span><span></span>`;
    todoList.append(empty);
    return;
  }

  for (const todo of items) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " done" : ""}`;

    const toggle = document.createElement("button");
    toggle.className = "icon-button";
    toggle.type = "button";
    toggle.title = todo.completed ? "Mark incomplete" : "Mark complete";
    toggle.textContent = todo.completed ? "✓" : "";
    toggle.addEventListener("click", () => updateTodo(todo.id, { completed: !todo.completed }));

    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = todo.title;

    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.title = "Delete task";
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteTodo(todo.id));

    item.append(toggle, title, remove);
    todoList.append(item);
  }
}

async function loadTodos() {
  todos = await api("/api/todos");
  renderTodos();
}

async function login(username, password) {
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  token = data.token;
  localStorage.setItem("todo-token", token);
  showTodos();
  await loadTodos();
}

async function register(username, password) {
  await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  await login(username, password);
}

async function updateTodo(id, changes) {
  setMessage(todoMessage, "");
  await api(`/api/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
  await loadTodos();
}

async function deleteTodo(id) {
  setMessage(todoMessage, "");
  await api(`/api/todos/${id}`, { method: "DELETE" });
  await loadTodos();
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(authMessage, "");

  const formData = new FormData(authForm);
  const username = String(formData.get("username")).trim();
  const password = String(formData.get("password"));

  try {
    await login(username, password);
    authForm.reset();
  } catch (error) {
    setMessage(authMessage, error.message);
  }
});

registerBtn.addEventListener("click", async () => {
  setMessage(authMessage, "");
  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;

  try {
    await register(username, password);
    authForm.reset();
  } catch (error) {
    setMessage(authMessage, error.message);
  }
});

logoutBtn.addEventListener("click", () => {
  token = "";
  localStorage.removeItem("todo-token");
  todos = [];
  showAuth();
});

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(todoMessage, "");
  const title = todoTitle.value.trim();
  if (!title) return;

  try {
    await api("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    todoTitle.value = "";
    await loadTodos();
  } catch (error) {
    setMessage(todoMessage, error.message);
  }
});

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderTodos();
  });
}

if (token) {
  showTodos();
  loadTodos().catch(() => {
    token = "";
    localStorage.removeItem("todo-token");
    showAuth();
  });
}
