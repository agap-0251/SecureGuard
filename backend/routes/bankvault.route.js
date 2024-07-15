const express=require('express')
const bankRoute=express.Router()
const auth = require('../middleware/auth.middleware')
const approved = require('../middleware/approved.middleware')

bankRoute.use(express.json())
bankRoute.use(express.urlencoded({ extended: true }))

const{getBankInfo,getBankInfoById,bankInfoEditSave,bankInfoSave,bankInfoDelete}=require('../controllers/BankVaultController')
bankRoute.use(auth);
bankRoute.use(approved);

bankRoute.get('/:id',getBankInfo)
// bankRoute.get('/:id',getBankInfoById)
bankRoute.put('/:id',bankInfoEditSave)
bankRoute.post('/',bankInfoSave)
bankRoute.delete('/:id',bankInfoDelete)

module.exports=bankRoute