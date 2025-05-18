var list = JSON.parse(localStorage.getItem('todos')) || [];

var filterButtons = document.querySelectorAll('.filter');
var clearButton = document.querySelector('.clear-completed-button');
var input = document.querySelector('.text-input');
var darkImage = document.querySelector('.theme-icon');
var itemsLeft = document.querySelector('.items-left');
var todoContainer = document.querySelector('.todo-list-items');
var darkButton = document.querySelector('.theme-icons');


function makeTodoItem(item) {
    var todoItem = document.createElement('li');
    todoItem.draggable = true;
    todoItem.dataset.id = item.id;
    todoItem.className = item.completed ? 'todo-item completed' : 'todo-item';
  
    
    todoItem.innerHTML = `
        <span class="check-box ${item.completed ? 'checked' : ''}"></span>
        <span class="todo-text">${item.text}</span>
        <button class="deleteButton">
            <img src="images/icon-cross.svg" alt="">
        </button>
    `;

    var check = todoItem.querySelector('.check-box');
    check.addEventListener('click', function() {
        finishedTodo(item.id);
    });

    var clearButton = todoItem.querySelector('.deleteButton');
    clearButton.addEventListener('click', function() {
        removeTodo(item.id);
    });

    return todoItem;
}

function finishedTodo(id) {
    for(var i = 0; i < list.length; i++) {
        if(list[i].id === id) {
            list[i].completed = !list[i].completed;
            break;
        }
    }
    saveToStore();
    displayTodos();
}

input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && input.value.trim() !== '') {
        var newItem = {
            id: new Date().getTime(),
            text: input.value.trim(),
            completed: false
        };
        
        list.push(newItem);
        saveToStore();
        displayTodos();
        input.value = '';
    }
});


function removeTodo(id) {
    list = list.filter(function(todo) {
        return todo.id !== id;
    });
    saveToStore();
    displayTodos();
}

clearButton.addEventListener('click', function() {
    list = list.filter(function(todo) {
        return !todo.completed;
    });
    saveToStore();
    displayTodos();
});

var currentView = 'all';
filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterButtons.forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        currentView = btn.dataset.filter;
        displayTodos();
    });
});

function displayTodos() {
    var todosToShow = list.filter(function(todo) {
        if(currentView === 'active') {
            return !todo.completed;
        } else if(currentView === 'completed') {
            return todo.completed;
        }
        return true;
    });

    todoContainer.innerHTML = '';
    
    for(var i = 0; i < todosToShow.length; i++) {
        todoContainer.appendChild(makeTodoItem(todosToShow[i]));
    }

    var notDone = list.filter(function(todo) {
        return !todo.completed;
    }).length;
    itemsLeft.textContent = notDone + (notDone === 1 ? ' item left' : ' items left');
}

function saveToStore() {
    localStorage.setItem('todos', JSON.stringify(list));
}

var itemBeingDragged = null;

todoContainer.addEventListener('dragstart', function(e) {
    itemBeingDragged = e.target;
    e.target.classList.add('dragging');
});

todoContainer.addEventListener('dragend', function(e) {
    e.target.classList.remove('dragging');
});

todoContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    var itemToInsertBefore = getItemToInsertBefore(todoContainer, e.clientY);
    var currentDragItem = document.querySelector('.dragging');
    
    if(!itemToInsertBefore) {
        todoContainer.appendChild(currentDragItem);
    } else {
        todoContainer.insertBefore(currentDragItem, itemToInsertBefore);
    }
});

function getItemToInsertBefore(container, y) {
    var draggableItems = [].slice.call(container.querySelectorAll('.todo-item:not(.dragging)'));

    if (draggableItems.length === 0) return null;

    var closest = null;
    var closestOffset = Number.NEGATIVE_INFINITY;

    draggableItems.forEach(function(item) {
        var box = item.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;

        if(offset < 0 && offset > closestOffset) {
            closest = item;
            closestOffset = offset;
        }
    });

    return closest;
}

todoContainer.addEventListener('dragend', function() {
    var newOrder = [].slice.call(todoContainer.querySelectorAll('.todo-item')).map(function(item) {
        return list.find(function(todo) {
            return todo.id === parseInt(item.dataset.id);
        });
    });
    list = newOrder;
    saveToStore();
});

function setTheme() {
    var isDarkMode = localStorage.getItem('darkTheme') === 'true';
    if (isDarkMode !== null) {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        darkImage.src = isDarkMode ? 'images/icon-sun.svg' : 'images/icon-moon.svg';
    }
}

darkButton.addEventListener('click', function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    darkImage.src = isDark ? 'images/icon-moon.svg' : 'images/icon-sun.svg';
    localStorage.setItem('darkTheme', !isDark);
});

setTheme();

displayTodos();