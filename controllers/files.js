const express = require('express')
const router = express.Router()
const passport = require("passport")
const HttpStatus = require('http-status-codes')
const {v4: uuidv4} = require('uuid')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const stat = promisify(fs.stat)
const FileModel = require('../models/FileModel')
const url = require('url')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const NotFoundException = require('../models/Exceptions/NotFoundException')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')

const restaurant = require('../services/RestaurantRepository')

router.post("/", passport.authenticate("jwt", {session: false}), upload)
router.get("/:id/", download)

router.get("/release/client-android-app/", downloadClientApp)
router.post("/release/client-android-app/", uploadClientApp)

router.get("/release/staff-android-app/", downloadStaffApp)
router.post("/release/staff-android-app/", uploadStaffApp)

async function upload(req, res) {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(HttpStatus.BAD_REQUEST).send(new ErrorMessageModel('No files were uploaded.'))
    }

    try {
        let file = req.files.file
        let realFileName = file.name
        const extension = path.extname(realFileName)
        let randomFileName = `${uuidv4()}.${extension}`

        let fileInfo = new FileModel(undefined, realFileName, extension, randomFileName)
        await file.mv(`${global.gConfig.files_path}/${fileInfo.path}`)

        fileInfo = await restaurant.Files.saveFile(fileInfo)
        let returnedValue = {id: fileInfo.id, name: fileInfo.name, type: fileInfo.type}
        res.json(returnedValue)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function download(req, res) {
    try {
        const fileInfo = await restaurant.Files.getFile(req.params.id)
        const filePath = `${global.gConfig.files_path}/${fileInfo.path}`

        const isExist = await stat(filePath) // Будет исключение, если не существует.
        await res.download(filePath) // Set disposition and send it.
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel("File not found"))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function downloadClientApp(req, res) {
    try {
        const filePath = `${global.gConfig.files_path}/release/android-client/release.apk`

        try {
            const isExist = await stat(filePath) // Будет исключение, если не существует.
        } catch (e) {
            throw new NotFoundException("Not found")
        }

        await res.download(filePath) // Set disposition and send it.
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(e.toString()))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function uploadClientApp(req, res) {
    try {
        let file = req.files.file
        let realFileName = file.name
        const extension = path.extname(realFileName)
        if (!file || extension !== '.apk') {
            throw new InvalidArgumentException()
        }

        await file.mv(`${global.gConfig.files_path}/release/android-client/release.apk`)

        res.status(HttpStatus.CREATED).send()
    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).send(
                new ErrorMessageModel("The file does not exist or the extension is not apk"))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: e.message})
        }
    }
}

async function downloadStaffApp(req, res) {
    try {
        const filePath = `${global.gConfig.files_path}/release/android-staff/release.apk`

        try {
            const isExist = await stat(filePath) // Будет исключение, если не существует.
        } catch (e) {
            throw new NotFoundException("Not found")
        }

        await res.download(filePath) // Set disposition and send it.
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(e.toString()))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function uploadStaffApp(req, res) {
    try {
        let file = req.files.file
        let realFileName = file.name
        const extension = path.extname(realFileName)
        if (!file || extension !== '.apk') {
            throw new InvalidArgumentException()
        }

        await file.mv(`${global.gConfig.files_path}/release/android-staff/release.apk`)

        res.status(HttpStatus.CREATED).send()
    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).send(
                new ErrorMessageModel("The file does not exist or the extension is not apk"))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: e.message})
        }
    }
}

function fullUrl(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    })
}

module.exports = router
