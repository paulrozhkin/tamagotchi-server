const express = require('express')
    , router = express.Router()
    , passport = require("passport")
    , HttpStatus = require('http-status-codes')
    , { v4: uuidv4 } = require('uuid')
    , fs = require('fs')
    , path = require('path')
    , {promisify} = require('util')
    , stat = promisify(fs.stat)
    , FileModel = require('../models/FileModel')
    , url = require('url');


const restaurant = require('../services/RestaurantRepository');

router.post("/", passport.authenticate("jwt", {session: false}), upload);
router.get("/:id", download);

async function upload(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    try {
        let file = req.files.file;
        let realFileName = file.name;
        const extension = path.extname(realFileName)
        let randomFileName = `${uuidv4()}.${extension}`;

        let fileInfo = new FileModel(undefined, realFileName, extension,randomFileName)
        await file.mv(`${global.gConfig.files_path}\\${fileInfo.path}`);

        fileInfo = await restaurant.Files.saveFile(fileInfo);
        let returnedValue = {id: fileInfo.id, name: fileInfo.name, type: fileInfo.type, url: `${fullUrl(req)}/${fileInfo.id}`}
        res.json(returnedValue);
    } catch (e) {
        return res.status(500).send({message: e.message});
    }
}

async function download(req, res) {
    try {
        const fileInfo = await restaurant.Files.getFile(req.params.id);
        const filePath = `${global.gConfig.files_path}\\${fileInfo.path}`;

        const isExist = await stat(filePath);
        await res.download(filePath); // Set disposition and send it.
    } catch (err) {
        res.status(HttpStatus.NOT_FOUND).json({message: err.message});
    }
}

function fullUrl(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });
}

module.exports = router;
