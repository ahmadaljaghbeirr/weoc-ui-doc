export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.redirect(`${url.origin}/docs/`, 302);
    }

    const response = await env.ASSETS.fetch(request);

    // Preserve old/generated single-level documentation URLs without masking
    // unrelated 404s. Existing assets always win, and only HTML GET/HEAD
    // requests directly under /docs/ are eligible for the nested fallback.
    if (
      response.status === 404 &&
      (request.method === "GET" || request.method === "HEAD") &&
      /^\/docs\/[^/]+\.html$/.test(url.pathname)
    ) {
      url.pathname = url.pathname.replace("/docs/", "/docs/docs/");
      const nestedResponse = await env.ASSETS.fetch(new Request(url, request));

      if (nestedResponse.status !== 404) {
        return nestedResponse;
      }
    }

    return response;
  },
};
