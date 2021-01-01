const router = require("express").Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const multer = require('multer')
const path = require('path');
const verifyToken = require("./validate-token");

const User = require("../models/User")

// validation
const { registerValidation, loginValidation } = require("./validation");

// register route
router.post("/register", async (req, res) => {
  // validate the user
  const { error } = registerValidation(req.body);

  // throw validation errors
  if (error) return res.status(400).json({ error: error.details[0].message });

  const isEmailExist = await User.findOne({ email: req.body.email });

  // throw error when email already registered
  if (isEmailExist)
    return res.status(400).json({ error: "Email already exists" });

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    motivation_letter: req.body.motivation_letter,
    password,
  });

  try {
    const savedUser = await user.save();
    res.json({ error: null, data: { userId: savedUser._id } });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// login route
router.post("/login", async (req, res) => {
  // validate the user
  const { error } = loginValidation(req.body);

  // throw validation errors
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });

  // throw error when email is wrong
  if (!user) return res.status(400).json({ error: "Email is wrong" });

  // check for password correctness
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Password is wrong" });

  // create token
  const token = jwt.sign(
    // payload data
    {
      name: user.name,
      id: user._id,
    },
    process.env.TOKEN_SECRET
  );

  res.header("auth-token", token).json({
    error: null,
    data: {
      token,
    },
  });
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

//Upload route
router.post('/upload',verifyToken, upload.single('cv'), async(req, res, next) => {

    let token = req.header('auth-token');
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET );  
  
    console.log(decoded.id)
    
    User.findOneAndUpdate({ "_id": decoded.id },{ "$set": {"cv": req.file.path}},
      function(err,updatedObject) {
        if (err) {
          console.log(err)
          return res.status(500).send(err)

        }else{
          console.log(updatedObject)
          return res.status(200).send(updatedObject)
        }
      });
});

module.exports = router;
