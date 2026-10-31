const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const dateInput = document.getElementById("date");
const themeSelect = document.getElementById("theme");

let tasks = JSON.parse(localStorage.getItem("ninjaTasks")) || [];

const today = new Date();
const localDate = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.value = localDate;

// Original ninja-style sound using Web Audio API
let audioContext;

function playNinjaSound() {
  try {
    audioContext ||= new (
      window.AudioContext || window.webkitAudioContext
    )();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(
      700, audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      180, audioContext.currentTime + 0.18
    );

    gain.gain.setValueAtTime(
      0.12, audioContext.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001, audioContext.currentTime + 0.2
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log("Audio unavailable:", error);
  }
}

function saveTasks() {
  localStorage.setItem("ninjaTasks", JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Enter your mission first!");
    return;
  }

  playNinjaSound();

  tasks.push({
    id: Date.now() + Math.random(),
    text: text,
    date: dateInput.value,
    completed: false
  });

  taskInput.value = "";
  saveTasks();
  showTasks();
}

function toggleTask(id) {
  playNinjaSound();

  tasks = tasks.map(task => {
    if (task.id === id) {
      return {...task, completed: !task.completed};
    }
    return task;
  });

  saveTasks();
  showTasks();
}

function deleteTask(id) {
  playNinjaSound();
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  showTasks();
}

function showTasks() {
  taskList.innerHTML = "";

  const dailyTasks = tasks.filter(
    task => task.date === dateInput.value
  );

  dailyTasks.forEach(task => {
    const li = document.createElement("li");

    if (task.completed) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(task.id);

    const span = document.createElement("span");
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.append(checkbox, span, deleteBtn);
    taskList.appendChild(li);
  });

  updateProgress(dailyTasks);
}

function updateProgress(dailyTasks) {
  const total = dailyTasks.length;
  const completed = dailyTasks.filter(
    task => task.completed
  ).length;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("progressBar").style.width =
    percentage + "%";

  document.getElementById("progressText").textContent =
    `${percentage}% Completed (${completed}/${total})`;
}

function changeTheme() {
  playNinjaSound();
  document.body.className = themeSelect.value;
  localStorage.setItem("ninjaTheme", themeSelect.value);
}

dateInput.addEventListener("change", () => {
  playNinjaSound();
  showTasks();
});

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    addTask();
  }
});

const savedTheme = localStorage.getItem("ninjaTheme") || "naruto";
themeSelect.value = savedTheme;
document.body.className = savedTheme;

showTasks();
