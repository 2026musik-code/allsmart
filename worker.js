export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle API chat requests
        if (url.pathname === '/api/chat') {
            if (request.method !== 'POST') {
                return new Response('Method Not Allowed', { status: 405 });
            }

            try {
                const { messages, apiKey } = await request.json();

                if (!apiKey) {
                    return new Response(JSON.stringify({ error: 'API key is missing' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: messages,
                        model: 'llama3-8b-8192',
                    }),
                });

                const data = await groqResponse.json();

                if (!groqResponse.ok) {
                    return new Response(JSON.stringify(data), {
                        status: groqResponse.status,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });

            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Serve static assets
        try {
            return await env.ASSETS.fetch(request);
        } catch (e) {
            const pathname = url.pathname;
            return new Response(`Aset tidak ditemukan di path: ${pathname}`, {
                status: 404,
                headers: { 'Content-Type': 'text/plain' },
            });
        }
    },
};
