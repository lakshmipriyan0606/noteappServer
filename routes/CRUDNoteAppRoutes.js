import express from 'express'
import authMiddleware from '../controller/authMiddleware.js'
import { createNoteApp, deleteNoteApp, getNoteApp, updateNoteApp } from '../controller/CRUDNoteAppController.js'


 const noteAppRouter = express.Router()

noteAppRouter.post('/create', authMiddleware , createNoteApp )
noteAppRouter.get('/getdata', authMiddleware , getNoteApp )
noteAppRouter.post('/update/:id', authMiddleware , updateNoteApp )
noteAppRouter.post('/delete/:id', authMiddleware , deleteNoteApp )

export default noteAppRouter