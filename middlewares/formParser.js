const formidable = require("formidable");

const formParser = async (req, res, next) => {
  const form = formidable({ multiples: true });
  const acceptedFormats = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ]);
  const parsedReq = await form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({
        error: "Couldn't parse the form. Try again later",
      });
    }

    Object.keys(files).forEach((fileName) => {
      file = files[fileName];

      if (!Array.isArray(file)) {
        file = [file];
      }
      file.forEach((f) => {
        if (!acceptedFormats.has(f.type)) {
          return next(new Error("Unacceptable file format: " + f.name));
        }
      });
    });

    req.body = { ...files, ...fields, ...req.body };
    next();
  });
  if (parsedReq.type == "json") {
    next();
  }
};

module.exports = formParser;
