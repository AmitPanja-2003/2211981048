const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9876;
const BASE_API = process.env.BASE_API;
const TOKEN_TYPE = process.env.TOKEN_TYPE;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const WINDOW_SIZE = parseInt(process.env.WINDOW_SIZE, 10);

const numberWindow = []; 

const apiMap = {
    p: 'primes',
    f: 'fibo',
    e: 'even',
    r: 'rand'
};

const fetchNumbers = async (type) => {
    const url = `${BASE_API}/${apiMap[type]}`;
    try {
        const response = await axios.get(url, {
            timeout: 500, 
            headers: {
                Authorization: `${TOKEN_TYPE} ${ACCESS_TOKEN}`
            }
        });
        console.log(response)

        if (response.status === 200 && response.data.numbers) {
            return response.data.numbers;
        }
    } catch (err) {
        return [];
    }
    return [];
};

app.get('/numbers/:numberid', async (req, res) => {
    const startTime = Date.now();
    const { numberid } = req.params;
    const prevState = [...numberWindow];

   
    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const newNumbers = await fetchNumbers(numberid);
    console.log(numberWindow)

    newNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= WINDOW_SIZE) {
                numberWindow.shift(); 
            }
            numberWindow.push(num);
        }
    });

    const avg = numberWindow.length > 0
        ? (numberWindow.reduce((acc, n) => acc + n, 0) / numberWindow.length).toFixed(2)
        : 0.00;

    const timeTaken = Date.now() - startTime;
    if (timeTaken > 500) {
        return res.status(504).json({ error: 'Time take more' });
    }

    return res.json({
        windoPrevState: prevState,
        windowCurrstate: [...numberWindow],
        numbers: [...numberWindow],
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});