const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "administrator") {
    return res.status(403).render("pages/unauthorised.twig", {
      errors: { authorization: "Administrator access required" }
    });
  }
  next();
};

module.exports = requireAdmin;