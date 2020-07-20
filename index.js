const express = require('express');
const database = require('./database');
const server = express();
server.use(express.json());

server.use((req,res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

let nextId = null;

async function getNextId(req,res, next) {
    await database.query(`SELECT MAX(id) from controle_estoque;`,
    {type: database.QueryTypes.SELECT})
    .then(id => {
        nextId = id[0].max;
        nextId ++;
    });

    next();
}

server.post('/products', getNextId, async (req,res) => {
    let products;
    const {name, brand, quantity, perishable} = req.body;

    await database.query(`INSERT INTO controle_estoque VALUES (${nextId}, '${name}',
    '${brand}', ${quantity}, '${perishable}');`,
    {type: database.QueryTypes.INSERT})
    .then((result) => {
        products = result;
    })
    .catch((error) => {
        return res.json(error);
    })

    if(products[1]){
        return res.json('produto inserido com sucesso');
    } else {
        return res.json('erro ao inserir produto')
    }
});

server.get('/', (req,res) => {
    return res.json({result: 'API Controle de Estoque'});
});

server.get('/products', async (req,res) => {
    let products;

    await database.query(`SELECT * FROM controle_estoque;`,
    {type: database.QueryTypes.SELECT})
    .then((results) => {
        products = results;
    })
    .catch((error) => {
        return res.json('erro ao buscar produtos');
    })

    return res.json({products});
});

server.get('/products/:id', async (req, res) => {
    const {id} = req.params;
    let products;
    
    await database.query(`SELECT * FROM controle_estoque WHERE id = ${id};`,
    {type: database.QueryTypes.SELECT})
    .then(result => {
        products = result;
    })
    .catch(error => {
        return res.json(error);
    })
    return res.json({products});
})

server.delete('/products/:id', async (req,res) => {
    const {id} = req.params;

    await database.query(`DELETE FROM controle_estoque WHERE id = ${id};`,
    {type: database.QueryTypes.DELETE})
    .catch((error) => {
        return res.json('erro ao excluir produto');
    })

    return res.json({result: 'produto excluído com sucesso'});
})

server.put('/products/:id', async (req,res)=> {
    let products;
    const {id} = req.params;

    const {name, brand, quantity, perishable} = req.body;

    await database.query(`UPDATE controle_estoque SET name = '${name}', brand = '${brand}', quantity = '${quantity}', perishable = '${perishable}' WHERE id = ${id};`,
    {type: database.QueryTypes.UPDATE})
    .then((result) => {
        products = result;
    })
    .catch((error) => {
        return res.json('erro ao atualizar produto');
    })

    return res.json({result: 'produto atualizado com sucesso'})
})

server.listen(process.env.PORT);