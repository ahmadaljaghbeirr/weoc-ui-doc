export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.redirect(`${url.origin}/docs/`, 302);
    }

    return env.ASSETS.fetch(request);
  },
};
