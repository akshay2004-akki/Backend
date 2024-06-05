import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log('File field name:', file.fieldname);
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      console.log("file original name : ", file.originalname);
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({
    storage
})