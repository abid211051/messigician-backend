import multer from "multer";
import {
  ALLOWABLE_DOC_FORMAT,
  ALLOWABLE_IMAGE_FORMAT,
} from "../utils/constants.js";

const fileFilter = (req, file, cb) => {
  if (
    [...ALLOWABLE_DOC_FORMAT, ...ALLOWABLE_IMAGE_FORMAT].includes(file.mimetype)
  )
    cb(null, true);
  else
    cb(
      new Error(
        `Invalid file type. Allowed: ${[...ALLOWABLE_DOC_FORMAT, ...ALLOWABLE_IMAGE_FORMAT].join(", ")}`,
      ),
      false,
    );
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
});

const uploadSingle = upload.single("file");
const uploadMultiple = upload.array("files", 3);

export { uploadSingle, uploadMultiple };
