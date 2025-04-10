// ...всё до этого без изменений

// Promo route — сохранить
app.post('/promo', async (req, res) => {
  try {
    const { text, promo_code, image_url = '', expires_at } = req.body;

    const promo = new Promo({ text, promo_code, image_url, expires_at });

    await promo.save();
    res.status(201).json({ message: 'Промокод сохранён', promo });
  } catch (err) {
    console.error('Ошибка при сохранении промокода:', err);
    res.status(500).json({ message: 'Ошибка при сохранении промокода' });
  }
});

// ✅ Новый маршрут — получить все промокоды
app.get('/promo', async (req, res) => {
  try {
    const promos = await Promo.find().sort({ expires_at: -1 });
    res.json(promos);
  } catch (err) {
    console.error('Ошибка при получении промокодов:', err);
    res.status(500).json({ message: 'Ошибка при получении промокодов' });
  }
});

// Старт сервера
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
