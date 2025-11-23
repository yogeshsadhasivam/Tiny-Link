const Link = require("../model/link.js");

const healtCheck = (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
};

const toIST = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

const getAllLinks = async (req, res) => {
  try {
    const links = await Link.findAll({ order: [["created_at", "DESC"]] });
    const formatted = links.map((link) => ({
      code: link.code,
      target: link.target,
      clicks: link.clicks,
      last_clicked: toIST(link.last_clicked),
      created_at: toIST(link.created_at),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
};

const createNewLink = async (req, res) => {
  try {
    const { target, code } = req.body ?? {};

    try {
      const u = new URL(target);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("invalid protocol");
      }
    } catch (e) {
      return res.status(400).json({ error: "invalid_target" });
    }

    const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

    let finalCode = code;
    if (finalCode) {
      if (typeof finalCode !== "string" || !CODE_REGEX.test(finalCode)) {
        return res.status(400).json({ error: "invalid_code" });
      }
      const exists = await Link.findByPk(finalCode);
      if (exists) return res.status(409).json({ error: "code_exists" });
    } else {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const gen = (len = 6) =>
        Array.from(
          { length: len },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join("");

      for (let i = 0; i < 5; i++) {
        const candidate = gen(6);
        const exists = await Link.findByPk(candidate);
        if (!exists) {
          finalCode = candidate;
          break;
        }
      }
      if (!finalCode) {
        return res.status(500).json({ error: "could_not_generate_code" });
      }
    }

    const created = await Link.create({ code: finalCode, target });
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
};

const getSingleLink = async (req, res) => {
  try {
    const { code } = req.params;
    const link = await Link.findByPk(code);
    if (!link) return res.status(404).json({ error: "not_found" });
    return res.json(link);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { code } = req.params;
    const deleted = await Link.destroy({ where: { code } });
    if (deleted === 0) return res.status(404).json({ error: "not_found" });
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
};

const redirectLink = async (req, res, next) => {
  const { code } = req.params;
  const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

  if (!CODE_REGEX.test(code)) return next();

  try {
    const link = await Link.findByPk(code);
    if (!link) return res.status(404).send("Not found");

    await link.increment("clicks");
    link.last_clicked = new Date();
    await link.save();

    return res.redirect(302, link.target);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};
module.exports = {
  healtCheck,
  getAllLinks,
  createNewLink,
  getSingleLink,
  deleteLink,
  redirectLink,
};
