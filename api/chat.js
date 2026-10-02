export default async function handler(req, res) {
    // Pastikan hanya menerima request tipe POST dari frontend
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { model, prompt } = req.body;

    try {
        // Mengambil kunci rahasia dari Environment Variable
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            throw new Error("API Key belum dikonfigurasi di server.");
        }

        // Melakukan request ke OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Gagal menghubungi API pihak ketiga.");
        }

        // Mengirim balik teks hasil ke frontend
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
