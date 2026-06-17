import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { username } = await req.json();
    if (!username) return new Response(JSON.stringify({ error: 'username obrigatorio' }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 400 });

    const user = username.replace('@', '').trim();

    // Tentativa 1: endpoint interno do Instagram Web
    try {
      const r1 = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'X-IG-App-ID': '936619743392459',
          'Accept': '*/*',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Referer': 'https://www.instagram.com/',
          'Origin': 'https://www.instagram.com',
        },
      });
      if (r1.ok) {
        const data = await r1.json();
        const u = data?.data?.user;
        if (u) {
          return new Response(JSON.stringify({
            seguidores: u.edge_followed_by?.count ?? null,
            seguindo: u.edge_follow?.count ?? null,
            posts: u.edge_owner_to_timeline_media?.count ?? null,
            nome: u.full_name ?? null,
            bio: u.biography ?? null,
          }), { headers: { ...cors, 'Content-Type': 'application/json' } });
        }
      }
    } catch (_) { /* segue para fallback */ }

    // Tentativa 2: scraping da pagina publica
    const r2 = await fetch(`https://www.instagram.com/${user}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    const html = await r2.text();

    const seg = html.match(/"edge_followed_by":\{"count":(\d+)\}/) ||
                html.match(/"followers_count":(\d+)/) ||
                html.match(/"followersCount":(\d+)/);
    const posts = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/) ||
                  html.match(/"media_count":(\d+)/);

    if (seg) {
      return new Response(JSON.stringify({
        seguidores: parseInt(seg[1]),
        posts: posts ? parseInt(posts[1]) : null,
      }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Instagram bloqueou. Preencha manualmente.' }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: 503,
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message) }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
