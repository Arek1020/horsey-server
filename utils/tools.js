const mkdirp = require('mkdirp');
const multer = require('multer');


const tools = {
    uploadFile: function (req, res, dir, maxFileSize, file, callback, extensionResult, saveExtension) {
        mkdirp.sync(dir)
        var name = ''
        var originalname = ''
        var date = new Date()
        var timestamp = date.getTime()
        var storage = multer.diskStorage({
            destination: function destination(req, file, cb) {
                cb(null, dir)
            },
            filename: function filename(req, file, cb) {
                originalname = file.originalname
                name = file.originalname.split('.')[0] + '_' + timestamp
                if (saveExtension && file.originalname.split('.').length == 2)
                    name = name + '.' + file.originalname.split('.')[1]
                    name += '.JPG'
                cb(null, originalname)
            }
        })
        var data = {
            success: true,
            warnings: [],
            attachments: []
        }
        var upload = multer({ storage, limits: { fileSize: maxFileSize } }).single(file)
        upload(req, res, function (err) {
            if (err) {
                data.success = false
                data.error = err
                console.log(err)
                return callback(data, null)
            } else {
                if (extensionResult)
                    return callback({ name, originalname })
                return callback(originalname, req.body)
            }
        })
    },
}

module.exports = tools;