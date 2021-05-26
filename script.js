let allTasks = [];
let valueInput = '';
let textareaValue = '';
let input = null;
const content = document.getElementById('content-tasks');
let isEdit = null;
let result = null;


window.onload = async () => {
  input = document.getElementById('add-task');
  input.addEventListener('keyup', updateValue);
  input.addEventListener('keydown', onEnterPressAdd);
  const resp = await fetch('http://localhost:8000/allTasks', {
    method: 'GET'
  })

  result = await resp.json();
  allTasks = result.data;

  render();
}

render = () => {
  cleaning();

  allTasks.sort((a, b) => {
    return a.isCheck - b.isCheck
  });

  let container = null;

  allTasks.map((item, index) => {
    container = (isEdit === index) ? editableTask(item, index) : Task(item, index);
    content.appendChild(container);
  });
}

const updateValue = (e) => {
  valueInput = e.target.value;
}

const updateTask = (e) => {
  textareaValue = e.target.value;
}

const onEnterPressAdd = (e) => {
  if (e.code === 'Enter') {
    onAddClick();
  }
}

const onEnterPressEdit = (e, index) => {
  if (e.code === 'Enter') {
    onDoneClick();
  }
}

const onAddClick = async () => {
  if (!valueInput.trim()) {
    alert('Напиши что-нибудь :(');
    input.value = '';
    return;
  }
  const resp = await fetch('http://localhost:8000/createTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      text: valueInput.trim(),
      isCheck: false
    })
  })
  let result = await resp.json();
  allTasks = result.data;

  input.value = '';
  render();
}

const onChangeCheckbox = (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;
  render();
}

const onDeleteClick = async (index) => {

  const resp = await fetch(`http://localhost:8000/deleteTask?id=${allTasks[index].id}`, {
    method: 'DELETE'
  })
  let result = await resp.json();
  allTasks = result.data;

  render();
}

const onEditClick = (index) => {
  isEdit = index;
  render();
}

const onCancelClick = (index) => {
  isEdit = null;
  render();
}

const onDoneClick = async (index) => {
  let {text, isCheck, id} = allTasks[index];

  if (!textareaValue.trim()) {
    alert('Ты удалил весь текст, поэтому я удалю эту таску :)');
    onDeleteClick();
    render();
    return;
  }

  const resp = await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      id: id,
      text: textareaValue.trim(),
      isCheck: isCheck
    })
  })
  result = await resp.json();
  allTasks = result.data;
  isEdit = null;
  render();
}

const cleaning = () => {

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
}

const Task = (item, index) => {
  const container = document.createElement('div');
  container.id = `task-${index}`;
  container.className = `task-container`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox';
  checkbox.checked = item.isCheck;
  checkbox.onchange = () => {
    onChangeCheckbox(index);
  };
  container.appendChild(checkbox);

  const text = document.createElement('p');
  text.innerText = item.text;
  text.className = item.isCheck ? 'task-text task-text-check' : 'task-text';
  container.appendChild(text);

  if (!item.isCheck) {
    const buttonEdit = document.createElement('button');
    buttonEdit.className = `edit-button button`;
    buttonEdit.onclick = () => {
      onEditClick(index);
    };
    container.appendChild(buttonEdit);
  }

  const buttonDelete = document.createElement('button');
  buttonDelete.className = `delete-button button`;
  buttonDelete.onclick = () => {
    onDeleteClick(index);
  };
  container.appendChild(buttonDelete);

  return container;
}

const editableTask = (item, index) => {
  const container = document.createElement('div');
  container.id = `task-${index}`;
  container.className = `task-container`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox';
  checkbox.checked = item.isCheck;
  checkbox.onchange = () => {
    onChangeCheckbox(index);
  };
  container.appendChild(checkbox);

  checkbox.disabled = true;

  const textEdit = document.createElement('textarea');
  textEdit.className = 'textarea-edit';
  textEdit.value = item.text;
  textEdit.id = 'textEdit';
  textareaValue = item.text;
  textEdit.onkeyup = (e) => updateTask(e);
  textEdit.onkeypress = (e) => onEnterPressEdit(e, index);
  container.appendChild(textEdit);

  const buttonDoneEdit = document.createElement('button');
  buttonDoneEdit.className = `done-button button`;
  buttonDoneEdit.onclick = () => {
    onDoneClick(index);
  };
  container.appendChild(buttonDoneEdit);

  const buttonCancelEdit = document.createElement('button');
  buttonCancelEdit.className = `cancel-button button`;
  buttonCancelEdit.onclick = () => {
    onCancelClick(index);
  };
  container.appendChild(buttonCancelEdit);

  return container;
}
