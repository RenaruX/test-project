import express from 'express';
import axios from 'axios';
import { insertAdvice } from './app/advice';

const router = express.Router();

router.get('/', (req, res) => res.send('API IS UP!'));

router.post('/advice', async (req, res) => {
    const { body: { query } } = req;
    
    try {
        if(!query) throw new Error('No query found. Must send the parameter query in JSON format') 

        const { data } = await axios.get(`https://api.adviceslip.com/advice/search/${query}`);
        const { message, total_results, slips } = data;
        
        if(message) throw new Error(message?.text);
        if(total_results <= 0 || !slips instanceof Array) throw new Error('No results found');

        const [{ id: api_id, advice }] = slips;
        const insertResult = await insertAdvice({ api_id, advice });

        return res.send({
            success: true,
            message: 'ok',
            advice,
            insertResult
        });
    }
    catch(e) {
        console.error(e);
        res.status(400);
        return res.send({
            success: false,
            message: e.message
        });
    }
});

export default router;
