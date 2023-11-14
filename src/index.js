const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const users = [];

app.post('/criar-conta', (req, res) => {
    const { name, email, password } = req.body;

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
    };

    users.push(newUser);
    res.json(newUser);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ message: 'Login bem-sucedido', user });
});


app.listen(8080, () => console.log("Servidor iniciado"));
