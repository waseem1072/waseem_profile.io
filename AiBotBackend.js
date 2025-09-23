app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const context = getWebsiteContext(userMessage); // function to fetch product/FAQ info
    const response = await callGeminiAPI(userMessage, context);
    res.json({ reply: response });
});
