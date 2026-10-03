const BACKEND_URL = "http://localhost:5012/api/tasks";

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();

    setupAddButtons();
    setupDragAndDrop();
});

// TASKOK LEKÉRÉSE

async function loadTasks() {
    try {
        const response = await fetch(BACKEND_URL);

        if (!response.ok) {
            throw new Error("Nem sikerült lekérni a taskokat.");
        }

        const tasks = await response.json();

        // Előző taskok törlése a felületről
        clearTaskLists();

        // Taskok megjelenítése
        tasks.forEach(task => {
            displayTask(task);
        });

    } catch (error) {
        console.error(error);
        alert("Hiba történt a taskok betöltésekor.");
    }
}

// TASK MEGJELENÍTÉSE

function displayTask(task) {

    let list;

    if (task.status === "to-do") {
        list = document.getElementById("todo-list");
    }
    else if (task.status === "in-progress") {
        list = document.getElementById("in-progress-list");
    }
    else if (task.status === "done") {
        list = document.getElementById("done-list");
    }
    else {
        return;
    }


    const taskElement = document.createElement("div");

    taskElement.classList.add("task");

    // Drag & drop miatt
    taskElement.draggable = true;

    taskElement.dataset.id = task.id;


    taskElement.innerHTML = `
        <h3>${task.title}</h3>

        <p>${task.description}</p>

        <div class="task-buttons">
            <button class="edit-button">Módosítás</button>
            <button class="delete-button">Eltávolítás</button>
        </div>
    `;


    // Módosítás gomb
    const editButton = taskElement.querySelector(".edit-button");

    editButton.addEventListener("click", () => {
        editTask(task);
    });


    // Törlés gomb
    const deleteButton = taskElement.querySelector(".delete-button");

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });


    // Drag kezdete
    taskElement.addEventListener("dragstart", () => {
        taskElement.classList.add("dragging");
    });


    // Drag vége
    taskElement.addEventListener("dragend", () => {
        taskElement.classList.remove("dragging");
    });


    list.appendChild(taskElement);
}

// ADD GOMBOK

function setupAddButtons() {

    const addButtons = document.querySelectorAll(".add-button");

    addButtons.forEach(button => {

        button.addEventListener("click", () => {

            const status = button.dataset.status;

            createTask(status);
        });

    });
}

// ÚJ TASK LÉTREHOZÁSA

async function createTask(status) {

    const title = prompt("Task neve:");

    if (title === null || title.trim() === "") {
        return;
    }


    const description = prompt("Task leírása:");

    if (description === null) {
        return;
    }


    const newTask = {
        title: title.trim(),
        description: description.trim(),
        status: status
    };


    try {

        const response = await fetch(BACKEND_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newTask)
        });


        if (!response.ok) {
            throw new Error("Nem sikerült létrehozni a taskot.");
        }


        const createdTask = await response.json();

        displayTask(createdTask);

    }
    catch (error) {

        console.error(error);

        alert("Hiba történt a task létrehozásakor.");
    }
}

// TASK MÓDOSÍTÁSA

async function editTask(task) {

    const newTitle = prompt("Task neve:", task.title);

    if (newTitle === null || newTitle.trim() === "") {
        return;
    }


    const newDescription = prompt(
        "Task leírása:",
        task.description
    );

    if (newDescription === null) {
        return;
    }


    const updatedTask = {

        id: task.id,

        title: newTitle.trim(),

        description: newDescription.trim(),

        status: task.status
    };


    try {

        const response = await fetch(
            `${BACKEND_URL}/${task.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedTask)
            }
        );


        if (!response.ok) {
            throw new Error("Nem sikerült módosítani a taskot.");
        }


        // Frissítjük a teljes listát
        loadTasks();

    }
    catch (error) {

        console.error(error);

        alert("Hiba történt a task módosításakor.");
    }
}

// TASK TÖRLÉSE

async function deleteTask(id) {

    const confirmed = confirm(
        "Biztosan törölni szeretnéd ezt a taskot?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${BACKEND_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Nem sikerült törölni a taskot.");
        }


        loadTasks();

    }
    catch (error) {

        console.error(error);

        alert("Hiba történt a task törlésekor.");
    }
}

// DRAG & DROP

function setupDragAndDrop() {

    const taskLists = document.querySelectorAll(".task-list");


    taskLists.forEach(list => {

        // Amikor egy task fölé érünk
        list.addEventListener("dragover", event => {

            event.preventDefault();

            list.classList.add("drag-over");
        });


        // Amikor elhagyjuk az oszlopot
        list.addEventListener("dragleave", () => {

            list.classList.remove("drag-over");
        });


        // Amikor elengedjük a taskot
        list.addEventListener("drop", async event => {

            event.preventDefault();

            list.classList.remove("drag-over");


            const draggingTask =
                document.querySelector(".dragging");


            if (!draggingTask) {
                return;
            }


            const taskId =
                Number(draggingTask.dataset.id);


            const newStatus =
                list.dataset.status;


            await changeTaskStatus(taskId, newStatus);

        });

    });
}

// TASK STÁTUSZÁNAK MÓDOSÍTÁSA

async function changeTaskStatus(id, newStatus) {

    try {

        // Először lekérjük az aktuális taskokat
        const response = await fetch(BACKEND_URL);

        if (!response.ok) {
            throw new Error("Nem sikerült lekérni a taskokat.");
        }


        const tasks = await response.json();


        const task = tasks.find(task => task.id === id);


        if (!task) {
            return;
        }


        // Megváltoztatjuk a státuszt
        task.status = newStatus;


        // PUT kérés a backendnek
        const updateResponse = await fetch(
            `${BACKEND_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(task)
            }
        );


        if (!updateResponse.ok) {
            throw new Error("Nem sikerült módosítani a task státuszát.");
        }


        // Frissítjük a megjelenítést
        loadTasks();

    }
    catch (error) {

        console.error(error);

        alert("Hiba történt a task áthelyezésekor.");
    }
}

// LISTÁK KIÜRÍTÉSE

function clearTaskLists() {

    document.getElementById("todo-list").innerHTML = "";

    document.getElementById("in-progress-list").innerHTML = "";

    document.getElementById("done-list").innerHTML = "";
}