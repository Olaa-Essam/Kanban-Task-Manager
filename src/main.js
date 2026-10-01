"use strict";
const STORAGE_KEY = "kanbanTasks";
let tasks = [];
let editingTaskId = null;
const openModalBtn = document.querySelector("#openModalBtn");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelBtn = document.querySelector("#cancelBtn");
const modalOverlay = document.querySelector("#modalOverlay");
const modalTitle = document.querySelector("#modalTitle");
const taskForm = document.querySelector("#taskForm");
const taskTitleInput = document.querySelector("#taskTitle");
const taskPriorityInput = document.querySelector("#taskPriority");
const taskDateInput = document.querySelector("#taskDate");
const taskDescriptionInput = document.querySelector("#taskDescription");
const characterCount = document.querySelector("#characterCount");
const submitText = document.querySelector("#submitText");
const todoList = document.querySelector("#todoList");
const progressList = document.querySelector("#progressList");
const doneList = document.querySelector("#doneList");
const todoCount = document.querySelector("#todoCount");
const progressCount = document.querySelector("#progressCount");
const doneCount = document.querySelector("#doneCount");
function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) {
        tasks = [];
        return;
    }
    try {
        tasks = JSON.parse(savedTasks);
    }
    catch {
        tasks = [];
    }
}
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function openModal() {
    modalOverlay?.classList.add("active");
    taskTitleInput?.focus();
}
function closeModal() {
    modalOverlay?.classList.remove("active");
    editingTaskId = null;
    taskForm?.reset();
    if (modalTitle) {
        modalTitle.textContent = "Create New Task";
    }
    if (submitText) {
        submitText.textContent = "Create Task";
    }
    if (characterCount) {
        characterCount.textContent = "0";
    }
}
function createTask(event) {
    event.preventDefault();
    if (!taskTitleInput ||
        !taskPriorityInput ||
        !taskDateInput ||
        !taskDescriptionInput) {
        return;
    }
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    if (!title) {
        return;
    }
    const newTask = {
        id: crypto.randomUUID(),
        title,
        description,
        priority: taskPriorityInput.value,
        dueDate: taskDateInput.value,
        status: "todo",
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeModal();
}
function editTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
        return;
    }
    editingTaskId = id;
    if (!taskTitleInput ||
        !taskPriorityInput ||
        !taskDateInput ||
        !taskDescriptionInput) {
        return;
    }
    taskTitleInput.value = task.title;
    taskPriorityInput.value = task.priority;
    taskDateInput.value = task.dueDate;
    taskDescriptionInput.value = task.description;
    if (modalTitle) {
        modalTitle.textContent = "Edit Task";
    }
    if (submitText) {
        submitText.textContent = "Save Changes";
    }
    if (characterCount) {
        characterCount.textContent = task.description.length.toString();
    }
    openModal();
}
function updateTask() {
    if (!editingTaskId) {
        return;
    }
    if (!taskTitleInput ||
        !taskPriorityInput ||
        !taskDateInput ||
        !taskDescriptionInput) {
        return;
    }
    const task = tasks.find((item) => item.id === editingTaskId);
    if (!task) {
        return;
    }
    const title = taskTitleInput.value.trim();
    if (!title) {
        return;
    }
    task.title = title;
    task.description = taskDescriptionInput.value.trim();
    task.priority = taskPriorityInput.value;
    task.dueDate = taskDateInput.value;
    saveTasks();
    renderTasks();
    closeModal();
}
function deleteTask(id) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) {
        return;
    }
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
}
function changeStatus(id, newStatus) {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
        return;
    }
    task.status = newStatus;
    saveTasks();
    renderTasks();
}
function formatDate(date) {
    if (!date) {
        return "No due date";
    }
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    const safeTitle = escapeHTML(task.title);
    const safeDescription = escapeHTML(task.description);
    card.innerHTML = `
    <div class="task-top">
      <h3 class="task-title">${safeTitle}</h3>

      <span class="priority ${task.priority}">
        ${task.priority}
      </span>
    </div>

    ${task.description
        ? `<p class="task-description">${safeDescription}</p>`
        : ""}

    <div class="task-footer">
      <span class="task-date">
        ${formatDate(task.dueDate)}
      </span>

      <div class="task-actions">
        <button
          class="task-action"
          data-action="edit"
          data-id="${task.id}"
          title="Edit task"
        >
          Edit
        </button>

        <button
          class="task-action"
          data-action="delete"
          data-id="${task.id}"
          title="Delete task"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="status-control">
      <label for="status-${task.id}">
        Move task
      </label>

      <select
        class="status-select"
        id="status-${task.id}"
        data-action="status"
        data-id="${task.id}"
      >
        <option value="todo" ${task.status === "todo" ? "selected" : ""}>
          To Do
        </option>

        <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>
          In Progress
        </option>

        <option value="done" ${task.status === "done" ? "selected" : ""}>
          Done
        </option>
      </select>
    </div>
  `;
    return card;
}
function renderTasks() {
    if (!todoList || !progressList || !doneList) {
        return;
    }
    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";
    const todoTasks = tasks.filter((task) => task.status === "todo");
    const progressTasks = tasks.filter((task) => task.status === "in-progress");
    const doneTasks = tasks.filter((task) => task.status === "done");
    if (todoTasks.length === 0) {
        todoList.innerHTML = `
      <div class="empty-state">
        No tasks here yet.
      </div>
    `;
    }
    if (progressTasks.length === 0) {
        progressList.innerHTML = `
      <div class="empty-state">
        No tasks in progress.
      </div>
    `;
    }
    if (doneTasks.length === 0) {
        doneList.innerHTML = `
      <div class="empty-state">
        Nothing completed yet.
      </div>
    `;
    }
    todoTasks.forEach((task) => {
        todoList.appendChild(createTaskCard(task));
    });
    progressTasks.forEach((task) => {
        progressList.appendChild(createTaskCard(task));
    });
    doneTasks.forEach((task) => {
        doneList.appendChild(createTaskCard(task));
    });
    updateTaskCounts();
}
function updateTaskCounts() {
    const todoTasks = tasks.filter((task) => task.status === "todo");
    const progressTasks = tasks.filter((task) => task.status === "in-progress");
    const doneTasks = tasks.filter((task) => task.status === "done");
    if (todoCount) {
        todoCount.textContent = `${todoTasks.length} ${todoTasks.length === 1 ? "task" : "tasks"}`;
    }
    if (progressCount) {
        progressCount.textContent = `${progressTasks.length} ${progressTasks.length === 1 ? "task" : "tasks"}`;
    }
    if (doneCount) {
        doneCount.textContent = `${doneTasks.length} ${doneTasks.length === 1 ? "task" : "tasks"}`;
    }
}
openModalBtn?.addEventListener("click", () => {
    openModal();
});
closeModalBtn?.addEventListener("click", () => {
    closeModal();
});
cancelBtn?.addEventListener("click", () => {
    closeModal();
});
modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});
taskForm?.addEventListener("submit", (event) => {
    if (editingTaskId) {
        event.preventDefault();
        updateTask();
    }
    else {
        createTask(event);
    }
});
taskDescriptionInput?.addEventListener("input", () => {
    if (characterCount && taskDescriptionInput) {
        characterCount.textContent =
            taskDescriptionInput.value.length.toString();
    }
});
document.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest(".task-action");
    if (!button) {
        return;
    }
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (!id) {
        return;
    }
    if (action === "edit") {
        editTask(id);
    }
    if (action === "delete") {
        deleteTask(id);
    }
});
document.addEventListener("change", (event) => {
    const target = event.target;
    if (!target.classList.contains("status-select")) {
        return;
    }
    const id = target.dataset.id;
    const newStatus = target.value;
    if (!id) {
        return;
    }
    changeStatus(id, newStatus);
});
loadTasks();
renderTasks();
