let idCount = 0;

let appState;

// Check if localStorage has data
if (localStorage.getItem("appState") === null) {
  // If no data, initialize with default todos
  appState = {
    todos: [],
    filters: {
      all: true,
      open: false,
      done: false,
    },
  };
} else {
  // If data exists, parse and load it
  appState = JSON.parse(localStorage.getItem("appState"));
}
/* shorter version for the above would be:
let appState = JSON.parse(localStorage.getItem("appState")) || { todos: [], filters: {all: true, open: false, done: false]} };
*/

// Set idCount to the highest existing ID + 1 or 0 if there are no todos
if (appState.todos.length === 0) {
  idCount = 0;
} else {
  const allIds = appState.todos.map((todo) => todo.id); // Extract all IDs into an array
  const maxId = Math.max(...allIds); // find the highest number in the array
  idCount = maxId; // later we use ++idCount to increment the IDs
}

const btnAdd = document.querySelector("#btn-add-todo");
const btnRemoveDone = document.querySelector("#btn-remove-done");
const inpNewTodo = document.querySelector("#inp-new-todo");
let filteredTodos = appState.todos; // initialize filteredTodos

/*_________________________________________________________________*/

applyFilter();
renderTodos(); // Initial rendering of the todo list
renderFilters(); // Initial rendering of filters

btnAdd.addEventListener("click", addTodo);
btnRemoveDone.addEventListener("click", removeDoneTodos);

/*_________________________________________________________________*/

function applyFilter() {
  // Reset filteredTodos to appState.todos
  filteredTodos = appState.todos;

  // Modify filteredTodos depending on filter & todo.doneState
  if (appState.filters.open === true) {
    filteredTodos = filteredTodos.filter((todo) => todo.doneState === false);
  } else if (appState.filters.done === true) {
    filteredTodos = filteredTodos.filter((todo) => todo.doneState === true);
  }
  // If 'all' is selected, filteredTodos will remain as appState.todos, no change needed
}

// Function to render filters
// Renders appState
function renderFilters() {
  const filtersList = document.querySelector("#filters");
  filtersList.innerHTML = "";

  // Loop through the filter keys in the appState.filters object
  Object.keys(appState.filters).forEach((filterKey) => {
    const filtersListEl = document.createElement("li");
    const filterRadio = document.createElement("input");
    filterRadio.type = "radio";
    filterRadio.name = "filter"; // Ensures radio buttons are grouped
    filterRadio.id = filterKey; // Set the radio button id to the filter key (all, done, open)

    // Set radio button status
    filterRadio.checked = appState.filters[filterKey];

    // Add filterObj to radio button
    filterRadio.filterObj = appState.filters;
    filterRadio.filterKey = filterKey; // Store the key separately

    // add label for radio button
    const radioLabel = document.createElement("label");
    radioLabel.setAttribute("for", filterKey); // label.for = ... wouldnt work because "for" is a reserved keyword in JavaScript
    const radioLabelText = document.createTextNode(filterKey);

    // Add to DOM
    filtersList.append(filtersListEl);
    filtersListEl.append(filterRadio);
    filtersListEl.append(radioLabel);
    radioLabel.append(radioLabelText);

    filterRadio.addEventListener("change", updateFilters);
  });
}

// Function to render the todo list
// Renders appState
function renderTodos() {
  const list = document.querySelector("#list");
  list.innerHTML = ""; // Clear the existing list before rendering

  // Loop through each todo item in the appState
  filteredTodos.forEach((todo) => {
    const todoLi = document.createElement("li"); // Create a list item element
    const checkbox = document.createElement("input"); // Create a checkbox input element
    checkbox.type = "checkbox"; // Set the input type to checkbox
    checkbox.checked = todo.doneState; // Set the checkbox state based on the todo item
    checkbox.id = "checkbox-" + todo.id;

    checkbox.todoObj = todo; // Attach the todo object to the checkbox (so the checkbox knows which to do it belongs to -> needed for definition of updateTodoState())

    // Add an event listener to update the doneState when the checkbox is clicked
    checkbox.addEventListener("change", updateTodoState);

    const checkboxLabel = document.createElement("label");
    checkboxLabel.setAttribute("for", checkbox.id);
    const todoText = document.createTextNode(todo.description); // Create a text node with the todo description
    checkboxLabel.append(todoText); // Append the text to the list item
    todoLi.append(checkbox, checkboxLabel); // Add the checkbox & label to the list item

    list.append(todoLi); // Add the list item to the list element
  });
}

// Callback function for evenListener > to add a new todo
// Modifies appState
function addTodo(event) {
  event.preventDefault();
  const inpNewTodoValue = inpNewTodo.value.trim(); // Removes spaces from input value

  // Check if user input is empty
  if (inpNewTodoValue === "") {
    inpNewTodo.value = ""; // clear input field
    return; // return (dont add todo)
  }

  // Check if user tries to add a duplicate todo
  if (
    appState.todos.some(
      (todo) => todo.description.toLowerCase() === inpNewTodoValue.toLowerCase()
    ) // Check if any todo in appState has a description that matches inpNewTodoValue (case-insensitive)
  ) {
    showHintDuplicate();
    return; // return (dont add todo)
  }

  // Add new todo to appState
  appState.todos.push({
    id: ++idCount,
    description: inpNewTodoValue,
    doneState: false,
  });

  applyFilter();
  renderTodos(); // render appState
  inpNewTodo.value = ""; // clear input field
  inpNewTodo.focus();
  updateLocalStorage();

  // Scroll the list container to the bottom after adding a todo
  const contentContainer = document.querySelector("#content");
  setTimeout(() => {
    // Ensure that the list container scrolls to bottom
    contentContainer.scrollTop = contentContainer.scrollHeight;
  }, 100); // Small delay to ensure DOM is rendering before scrolling happens
}

// Callback function for eventListener > to update the doneState of a todo item
// Modifies appState
function updateTodoState(event) {
  const todo = event.target.todoObj; // Get the associated todo object from the checkbox
  const currentTodoState = event.target.checked; // Get the updated checkbox state
  todo.doneState = currentTodoState; // Update the doneState in the state object
  setTimeout(() => {
    applyFilter(); // Reapply the filter after the delay
    renderTodos(); // Re-render the todo list after the filter is applied
    updateLocalStorage();
  }, 800);
}

// Callback function for eventListener > to update filters
// Modifies appState
function updateFilters(event) {
  const appStateFilters = event.target.filterObj; // Reference to appState.filters
  const selectedFilterKey = event.target.filterKey; // Key of the clicked filter

  // Update all appState filters
  Object.keys(appStateFilters).forEach((key) => {
    appStateFilters[key] = key === selectedFilterKey; // key === selectedFilterKey returns true or false, depending on whether the current key is the one the user selected
  });

  applyFilter(); // Reapply the filter based on updated filters
  renderFilters(); // Re-render the filters based on updated filters
  renderTodos(); // Re-render the todos based on the updated filteredTodos
  updateLocalStorage();
}

// Callback function for eventListener > to remove done todos
// Modifies appState
function removeDoneTodos(event) {
  appState.todos = appState.todos.filter((todo) => todo.doneState !== true);

  applyFilter();
  renderTodos();
  updateLocalStorage();
}

// Function that shows a hint that this to do already exists
function showHintDuplicate() {
  const hintDuplicate = document.createElement("span");
  hintDuplicate.id = "hint-duplicate";
  const hintDuplicateText = document.createTextNode("Todo already exists.");
  hintDuplicate.append(hintDuplicateText);

  const div = document.querySelector("#content");
  div.append(hintDuplicate);

  // Set a timeout to remove the warning message after 6 seconds (6000 milliseconds)
  setTimeout(() => {
    hintDuplicate.remove();
  }, 2400); // remove hint after 3s
  inpNewTodo.value = "";
  inpNewTodo.focus();
}

// Function to save current appState to Local Storage
function updateLocalStorage() {
  localStorage.setItem("appState", JSON.stringify(appState));
}
