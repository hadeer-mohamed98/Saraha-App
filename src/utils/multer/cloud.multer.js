
import multer from "multer";


export const fileValidation = {
  image:  ['image/jpeg', 'image/png', 'image/gif'],
  document:['application/pdf', 'application/json' , 'application/msword' , 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

}
export const cloudFileUpload = ({  validation=[] } = {}) => {

  const storage = multer.diskStorage({ });


  const fileFilter = function (req, file, callBack){
    if (validation.includes(file.mimetype)) {
      return callBack(null , true)
    }
    return callBack("invalid file format" , false)

  }
  return multer({
    fileFilter,
    storage,
  });
};

