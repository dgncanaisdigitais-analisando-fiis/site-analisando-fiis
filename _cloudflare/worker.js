// ADR-122: roda só quando nenhum arquivo do site bate com o caminho pedido (html_handling "none").
const achou = (r) => r.status === 200 || r.status === 304;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const caminho = url.pathname;
    const arquivo = (p) => env.ASSETS.fetch(new Request(new URL(p, url), request));
    if (caminho.endsWith("/")) {
      const r = await arquivo(caminho + "index.html");
      if (achou(r)) return r;
    } else if (!caminho.slice(caminho.lastIndexOf("/") + 1).includes(".")) {
      const pasta = await arquivo(caminho + "/index.html");
      if (achou(pasta)) return Response.redirect(new URL(caminho + "/" + url.search, url).toString(), 301);
      const html = await arquivo(caminho + ".html");
      if (achou(html)) return html;
    }
    const nf = await arquivo("/404.html");
    return new Response(request.method === "HEAD" ? null : nf.body, {status: 404, headers: nf.headers});
  },
};
