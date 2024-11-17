const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(console.error);

const Task = require('./models/task');

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, default: 'default' },
});

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);

// Routes
app.get('/tasks', async (req, res) => {
	

    console.log('Fetching tasks...'); 
    try {
        const tasks = await Task.find({}, 'text description priority');
        console.log(tasks);  
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);  
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});




app.post('/task/new', (req, res) => {
    const { text, description, priority } = req.body;
	console.log('Received task data:', { text, description, priority });
    if (!description) {
        console.error('Description is missing from the request body');
        return res.status(400).json({ error: 'Description field is required' });
    }

    const task = new Task({ text, description, priority });
    task.save()
        .then(savedTask => res.json(savedTask))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to create task', details: err.message });
        });
});



app.put('/task/update/:id', async (req, res) => {
    try {
        const { text, description } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.text = text || task.text; 
        task.description = description || task.description;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/task/delete/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        res.json({ result: deletedTask });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
