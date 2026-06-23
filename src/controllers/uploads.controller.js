const uploadToCloudinary = require("../utils/uploadToCloudinary");

class UploadController {
    local = async(req, res) => {

            const file = req.file;
            if (!file) {
                return res.status(400).json('file is required')
            }
            const filePath = file.path;
            return res.status(200).json({
                path: filePath,
                file: file
            })

        }
        //upload to clodinary
    external = async(req, res) => {
        const file = req.file;
        if (!file) {
            return res.status(400).json('file is required')
        }
        const filePath = await uploadToCloudinary(file);
        return res.status(200).json({
            path: filePath,
            file: file
        })
    }
}

module.exports = new UploadController()