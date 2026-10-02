export default async function handler(req, res) {
    // Keamanan: Tolak jika bukan POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { model, prompt } = req.body;

    // Pastikan prompt dan model tidak kosong
    if (!prompt || !model) {
        return res.status(400).json({ error: 'Model dan Prompt harus diisi' });
    }

    try {
        // Vercel Environment Variable (Rahasia)
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            throw new Error("API Key OpenRouter belum dikonfigurasi di Vercel Settings.");
        }

        // Hit API OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                // Opsional: Untuk identifikasi aplikasi (dianjurkan oleh OpenRouter)
                "HTTP-Referer": "https://pengujian-digital.vercel.app", 
                "X-Title": "Pengujian Digital Workspace"
            },
            body: JSON.stringify({
                model: model, // Menerima model secara dinamis dari frontend
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        // Tangkap error spesifik dari OpenRouter (misal model sedang down atau ID salah)
        if (!response.ok) {
            throw new Error(data.error?.message || "Terjadi kesalahan pada OpenRouter");
        }

        // Kembalikan jawaban ke frontend
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
