const uuid = require('uuid');
const {Vehicle_category, Admin} = require('../model/adminModel');
const {Customer,Customer_Vehilce} = require('../model/customerModel');
const joi = require('joi');
const validationJoi = require('../helper/joiValidation');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const {loggingRespons, errorResponse, notFoundResponse, badRequest, successResponse, successResponseWithData} = require('../middleware/apiResponse');
const { sequelize } = require('../helper/db');

module.exports.login = async(req,res) => {
    try {
        const schema = joi.object({
            email : joi.string().email().required(),
            password : joi.string().required()
        });
        validationJoi.joiValidation(schema,req.body);
        const email = req.body.email;
        const password = sha1(req.body.password);
        const getAdmin = await Admin.findOne({where :{email: email}});
        if(getAdmin){
            if(getAdmin && getAdmin.password == password){
                const token = jwt.sign(
                    {
                        userId : getAdmin.id,
                        userEmail : getAdmin.email
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.EXPRIE_TIME
                    }
                );
                loggingRespons(
                    res,
                    "OTP is verify",
                    token
                )
            }
            else{
                errorResponse(
                    res,
                    'Password Does not match'
                )
            }
        }
        else{
            notFoundResponse(
                res,
                'User not Found'
            )
        }
    } catch (error) {
        console.log('vehilceCategory Error', error);
        badRequest(res,error);
    }
}

module.exports.vehicleCategory = (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ 'message': 'title is required' });
        }
        else {
            console.log(req.body.title)
        }
        if (!req.body.vehicle_type) {
            res.status(400).json({ 'message': 'vehicle_type is required' });
        }
        if (!req.files.image) {
            res.status(400).json({ 'message': 'image is required' });
        }
        const { title, vehicle_type } = req.body;
        const image = req.files.image;
        // image.forEach(element => {
        //     const imageName = element.name;
        //     const imageExtantion = imageName.split('.').pop();
        //     const imageNewName = uuid.v1()+'.'+ imageExtantion;
        //     console.log('image',imageNewName);
        // });
        const imageName = image.name;
        const imageExtantion = imageName.split('.').pop();
        const images = uuid.v1() + '.' + imageExtantion;
        const data = {title, vehicle_type , images}
        const uploadPath = 'public/upImage/' + images;
        console.log('uploadPath',uploadPath)
        image.mv(uploadPath,async(error)=> {
            if(error){
                console.log('error',error);
            }
            else{
                const addCategory = await Vehicle_category.create(data);
                successResponse(
                    res,
                    'vehicle Cateory Add Successfuly'
                )
            }
        })

    } catch (error) {
        console.log('vehicleCategory Error', error);
        badRequest(res,error);
    }
}

module.exports.getCustomer = async(req,res) => {
    try {
        const customerData = await Customer.findAll({
            attributes : {exclude:['otp','status','createDate','updateDate']}
        });
        if(customerData){
            successResponseWithData(
                res,
                "Customer Data",
                customerData
            );
        }
        else{
            notFoundResponse(res,"Customer Data not Found");
        }
    } catch (error) {
        console.log('getCustomer Error', error);
        badRequest(res,error);
    }
}


module.exports.customerEdit = async(req,res) => {
    try {
        const customerId = req.params.Id;
        const getCustomer = await Customer.findOne({where:{id:customerId}});
        if(getCustomer){
            successResponseWithData(
                res,
                "Customer Data",
                getCustomer
            );
        }
        // console.log('getCustomer',getCustomer)
        else{
            notFoundResponse(res,"Customer Data Not Found");
        }
    } catch (error) {
        console.log('getCustomer Error', error);
        badRequest(res,error);
    }
}


module.exports.updateCustomer = async(req,res) => {
    try {
        const schema = joi.object({
            customerId : joi.number().required(),
            fullName : joi.string().required(),
            email : joi.string().email().required(),
            phoneNum : joi.string().required(),
            address : joi.string().required(),
            wing : joi.string().required(),
            society : joi.string().required(),
            state : joi.string().required(),
            city : joi.string().required(),
            pincode : joi.string().required(),
        });
        validationJoi.joiValidation(schema,req.body);
        const {customerId,fullName, email,phoneNum,address,wing,society,state,city,pincode} = req.body;
        const data = {customerId,fullName, email,phoneNum,address,wing,society,state,city,pincode};
        const update =  await Customer.update(data,{where:{id:customerId}});
        if(update){
            successResponse(
                res,
                'Customer Updated Successfuly'
            )
        }
    } catch (error) {
        console.log('getCustomer Error', error);
        badRequest(res,error);
    }
}


module.exports.vehicles = async(req,res) => {
    try {
        const vehicleData = await Customer_Vehilce.findAll({
            attributes : [
                'id','vehicle_type','vehicle_title','vehicle_model','vehicle_color','license_num','parking_num','createDate',
                // [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'vehilceImage/' + "',image')"), 'image')],
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'vehilceImage/' + "',image)"), 'image'] 
            ]
        });
        if(vehicleData){
            successResponseWithData(
                res,
                "Customer Data",
                vehicleData
            );
        }
        else{
            notFoundResponse(res,"Vehicle Data not Found");
        }
    } catch (error) {
        console.log('vehicles Error', error);
        badRequest(res,error);
    }
}