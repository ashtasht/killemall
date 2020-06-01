function validate_requst(ctx, role) {
  // Validate the request (for get and set)
  if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
    ctx.body = { "name": "Unauthorized", "code": 401, "message": "Token expired." };
    ctx.status = 401;
    return;
  }

  if (!ctx.state.user.roles.includes("get")) {
    ctx.body = { "name": "Forbidden", "code": 403, "message": "Access deniend to role 'get'." };
    ctx.status = 403;
    return;
  }

  if (!ctx.request.body.title) {
    ctx.body = { "name": "Bad Request", "code": 400, "message": "Title was not specified in the query's body." };
    ctx.status = 400;
    return;
  }
}
