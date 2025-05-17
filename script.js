var list = JSON.parse(localStorage.getItem('todos')) || [];

var filterButtons = document.querySelectorAll('.filter');
var clearButton = document.querySelector('.clear-completed-button');
var input = document.querySelector('.text-input');
var darkImage = document.querySelector('.theme-icon');
var itemsLeft = document.querySelector('.items-left');
var todoContainer = document.querySelector('.todo-list-items');
var darkButton = document.querySelector('.theme-icons');


function makeNewTodoItem(item) {
    var todoItem = document.createElement('li');
    todoItem.className = item.completed ? 'todo-item completed' : 'todo-item';
    todoItem.draggable = true;
    todoItem.dataset.id = item.id;
    
    // add the inner stuff
    todoItem.innerHTML = `
        <span class="check-box ${item.completed ? 'checked' : ''}"></span>
        <span class="todo-text">${item.text}</span>
        <button class="delete-btn">
            <images src="./images/icon-cross.svg" alt="Delete">
        </button>
    `;

    // handle clicking checkbox
    var check = todoItem.querySelector('.check-box');
    check.addEventListener('click', function() {
        markTodoDone(item.id);
    });

    // handle delete button
    var delButton = todoItem.querySelector('.delete-btn');
    delButton.addEventListener('click', function() {
        removeTodo(item.id);
    });

    return todoItem;
}

// add new todo when enter is pressed
input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && input.value.trim() !== '') {
        var newItem = {
            id: new Date().getTime(),
            text: input.value.trim(),
            completed: false
        };
        
        list.push(newItem);
        saveToStorage();
        showTodos();
        input.value = '';
    }
});

function markTodoDone(id) {
    for(var i = 0; i < list.length; i++) {
        if(list[i].id === id) {
            list[i].completed = !list[i].completed;
            break;
        }
    }
    saveToStorage();
    showTodos();
}

function removeTodo(id) {
    list = list.filter(function(todo) {
        return todo.id !== id;
    });
    saveToStorage();
    showTodos();
}

clearButton.addEventListener('click', function() {
    list = list.filter(function(todo) {
        return !todo.completed;
    });
    saveToStorage();
    showTodos();
});

var currentView = 'all';
filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterButtons.forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        currentView = btn.dataset.filter;
        showTodos();
    });
});

function showTodos() {
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
        todoContainer.appendChild(makeNewTodoItem(todosToShow[i]));
    }

    var notDone = list.filter(function(todo) {
        return !todo.completed;
    }).length;
    itemsLeft.textContent = notDone + (notDone === 1 ? ' item left' : ' items left');
}

function saveToStorage() {
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
    saveToStorage();
});

function setTheme() {
    var isDarkMode = localStorage.getItem('darkTheme') === 'true';
    if (isDarkMode !== null) {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        darkImage.src = isDarkMode ? './images/icon-sun.svg' : './images/icon-moon.svg';
    }
}

darkButton.addEventListener('click', function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    darkImage.src = isDark ? './images/icon-moon.svg' : './images/icon-sun.svg';
    localStorage.setItem('darkTheme', !isDark);
});

setTheme();
showTodos();