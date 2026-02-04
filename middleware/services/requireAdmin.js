const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "administrator") {
    return res.status(403).render("pages/unauthorised.twig", {
      errors: { authorization: "Administrator access required" }
    });
  }
   // User is an admin, continue to the next middleware or route
  next();
};

module.exports = requireAdmin;