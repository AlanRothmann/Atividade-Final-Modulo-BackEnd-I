const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.json());

const users = [];

// Criar conta
app.post('/criar-conta', async (req, res) => {
    const { name, email, password } = req.body;

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            messages: []
        };

        users.push(newUser);
        res.json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar a conta' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        res.json({ message: 'Login bem-sucedido', user });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login' })
    }

});


app.get("/usuarios", (request, response) => {
    return response.json(users);
});

// Adicionar novo recado
app.post('/novorecado/:userId', (req, res) => {
    const { userId } = req.params;
    const { messageContent } = req.body;

    const user = users.find(user => user.id === parseInt(userId));

    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const newMessage = {
        id: user.messages.length + 1,
        content: messageContent,
    };

    user.messages.push(newMessage);
    res.json({ message: 'Recado adicionado com sucesso', newMessage });
});

// Editar recado
app.put('/editarecado/:userId/:messageId', (req, res) => {
    const { userId, messageId } = req.params;
    const { messageContent } = req.body;

    const user = users.find(user => user.id === parseInt(userId));

    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const messageToUpdate = user.messages.find(message => message.id === parseInt(messageId));

    if (!messageToUpdate) {
        return res.status(404).json({ error: 'Recado não encontrado' });
    }

    messageToUpdate.content = messageContent;
    res.json({ message: 'Recado atualizado com sucesso', updatedMessage: messageToUpdate });
});

// Apagar recado
app.delete('/delrecado/:userId/:messageId', (req, res) => {
    const { userId, messageId } = req.params;

    const user = users.find(user => user.id === parseInt(userId));

    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const messageIndex = user.messages.findIndex(message => message.id === parseInt(messageId));

    if (messageIndex === -1) {
        return res.status(404).json({ error: 'Recado não encontrado' });
    }

    user.messages.splice(messageIndex, 1);
    res.json({ message: 'Recado apagado com sucesso' });
});

// Iniciar servidor
const port = process.env.PORT || 8080
app.listen(port, () => console.log("Servidor iniciado"));
