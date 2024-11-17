import React, { useState, useEffect } from 'react';
import { RiCloseCircleLine, RiEdit2Line } from 'react-icons/ri'; 
import './Task.css';

const api = 'http://localhost:3001';

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('default');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        fetchTasks();
		
    }, []);

	const fetchTasks = () => {
		fetch(api + '/tasks')
			.then(res => res.json())
			.then(data => {
				// Check if description is part of the task objects
				setTasks(data);
			})
			.catch(err => console.error('Error fetching tasks:', err));
	};
	

    const addTask = async () => {
        if (!newTask || !description) {
            alert('Please enter both a title and description');
            return;
        }
        if (priority === 'default') {
            alert('Please set the priority');
            return;
        }

        const taskData = {
            text: newTask,
            description: description,
            priority: priority
        };

        const response = await fetch(api + '/task/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        const data = await response.json();
        setTasks([...tasks, data]);
        setNewTask('');
        setDescription('');
        setPriority('default');
    };

    const deleteTask = async id => {
        const response = await fetch(api + '/task/delete/' + id, { method: 'DELETE' });
        const data = await response.json();
        setTasks(tasks.filter(task => task._id !== data.result._id));
    };
	console.log(tasks.description)
    const startEditing = task => {
        setEditingId(task._id);
        setEditTitle(task.text);
        setEditDescription(task.description);
    };

    const updateTask = async () => {
        if (!editTitle || !editDescription) {
            alert('Please enter both a title and description');
            return;
        }

        const updatedTask = { text: editTitle, description: editDescription };
        const response = await fetch(api + '/task/update/' + editingId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });
        const data = await response.json();
        setTasks(tasks.map(task => (task._id === data._id ? data : task)));
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
    };

    return (
        <div className="group">
            <div className="inputGroup">
                <input 
                    type="text" 
                    value={newTask} 
                    onChange={e => setNewTask(e.target.value)} 
                    placeholder="Task title" 
                    className="taskInput" 
                />
                <input 
                    type="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Description" 
                    className="taskInput" 
                />
                <select onChange={e => setPriority(e.target.value)} value={priority} className="priorityInput">
                    <option value="default">Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <div className="taskButton" onClick={addTask}>Add</div>
            </div>

            <div>
                {tasks.length > 0 ? tasks.map(task => (
                    <div className={`task ${task.priority}`} key={task._id}>
                        {editingId === task._id ? (
                            <div className="editContainer">
                                <input 
                                    type="text" 
                                    value={editTitle} 
                                    onChange={e => setEditTitle(e.target.value)} 
                                    placeholder="Edit title" 
                                    className="taskInput" 
                                />
                                <input 
                                    type="text" 
                                    value={editDescription} 
                                    onChange={e => setEditDescription(e.target.value)} 
                                    placeholder="Edit description" 
                                    className="taskInput" 
                                />
                                <div className="taskButton" onClick={updateTask}>Update</div>
                            </div>
                        ) : (
                            <div className="taskContent">
								
                                <strong>{task.text} {task.description}</strong>
                                <div className="icons">
                                    <button 
                                        onClick={() => startEditing(task)} 
                                        className="editButton">
                                        <RiEdit2Line /> 
                                    </button>
                                    <RiCloseCircleLine
                                        onClick={() => deleteTask(task._id)}
                                        className="deleteButton"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )) : <p>No tasks added yet</p>}
            </div>
        </div>
    );
}

export default TaskList;
