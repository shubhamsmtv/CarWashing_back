const { badRequest, successResponse } = require('../middleware/apiResponse');
const joi = require('joi');
const otoGenerator = require('otp-generator')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../helper/db');
const validation = require('../helper/joiValidation');
const { Washer_service, Service_Providers } = require('../model/washerModel');
const { Customer_Vehilce, Customer, Schedule_vehicle } = require('../model/customerModel')
const { Washer_task } = require('../model/adminModel');
const uuid = require('uuid')
const { successResponseWithData, notFoundResponse, errorResponse,  loggingRespons } = require('../middleware/apiResponse');



module.exports.add_service = async (req, res) => {
    try {
        const schema = joi.object({
            schedule_id: joi.number().required(),
            status: joi.string().required()
        });
        const { schedule_id, status } = req.body;
        const serviceData = { schedule_id, status }
        validation.joiValidation(schema, serviceData);
        serviceData.washer_id = req.userId;
        if (req.files && req.files.image) {
            const image = req.files.image
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/serviceImg/' + imageNewName;
            image.mv(uploadPath);
            serviceData.image =imageNewName
            const addServise = await Washer_service.create(serviceData);
            if (addServise) {
                await Schedule_vehicle.update({status:'In-progress'},{where:{id:schedule_id}});
                successResponse(
                    res,
                    'Service Added Successfuly',
                )
            }
        }
        else {
            res.json({ "message": "Image is required" });
        }
    } catch (error) {
        console.log('add_service', error);
        badRequest(res, error);
    }
}



module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            phone_num: joi.string().min(10).required().messages({"string.empty": "phone_num is required"}),
        });
        validation.joiValidation(schema, req.body);
        const phone_num = req.body.phone_num;
        const getMobile = await Service_Providers.findOne({ where: { phone_num: phone_num } });
        if (getMobile) {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phone_num, otp }
            const sendOTP = async (phone_num, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phone_num}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Service_Providers.update({ otp: otp }, { where: { phone_num: phone_num } });
                    return response
                }
            }
            const result = await sendOTP(phone_num, otp);
            console.log(otp);

            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
        else {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phone_num, otp }
            console.log(otp);
            const sendOTP = async (phone_num, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phone_num}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Service_Providers.create(data);
                    return response
                }
            }
            const result = await sendOTP(phone_num, otp);
            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
    } catch (error) {
        console.log('login', error);
        badRequest(res, error);
    }
}



module.exports.otpVerify = async (req, res) => {
    try {
        const schema = joi.object({
            phoneNum: joi.string().min(10).required().messages({"string.empty": "phone_num is required"}),
            otp: joi.number().min(4).required().messages({"string.empty": "otp is required"}),
            fcm_token: joi.string().required().messages({"string.empty": "fcm_token is required"}),
            device_type: joi.number().required().messages({"string.empty": "device_type is required"}),
        });
        validation.joiValidation(schema, req.body);
        const { fcm_token, device_type } = req.body;
        const otp = req.body.otp;
        const phone_num = req.body.phoneNum;
        const data = { fcm_token, device_type }
        const getUser = await Service_Providers.findOne({
            attributes: { exclude: ['createDate', 'updateDate'] },
            where: { phone_num: phone_num }
        });
        if (getUser) {
            console.log(getUser.otp == otp)
            if (getUser.otp == otp) {
                await Service_Providers.update(data, { where: { id: getUser.id } })
                const token = jwt.sign(
                    {
                        userId: getUser.id,
                        phoneNum: getUser.phone_num,
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.EXPRIE_TIME
                    }
                )
                if (getUser && getUser.Pro_status == 1) {
                    loggingRespons(
                        res,
                        "OTP is verify",
                        true,
                        token,
                        getUser
                    )
                }
                else {
                    loggingRespons(
                        res,
                        "OTP is verify",
                        false,
                        token,
                        getUser
                    )
                }
            }
            else {
                notFoundResponse(res, "Invalid otp");
            }
        }
        else {
            errorResponse(
                res,
                "Mobile number not exist"
            )
        }
    } catch (error) {
        console.log('otpVerify Error', error);
        badRequest(res, error);
    }
}



module.exports.completeProfile = (req, res) => {
    try {
        const schema = joi.object({
            fullName: joi.string().min(3).required().messages({"string.empty": "fullName is required"}),
            email: joi.string().email().min(3).required().messages({"string.empty": "email is required"}),
            phone_num: joi.string().min(10).required().messages({"string.empty": "phone_num is required"}),
            address: joi.string().min(3).required().messages({"string.empty": "address is required"}),
            state: joi.string().min(1).required().messages({"string.empty": "state is required"}),
            country: joi.string().min(3).required().messages({"string.empty": "country is required"}),
            city: joi.string().min(3).required().messages({"string.empty": "city is required"}),
        });
        const { fullName, email, phone_num, address, state, country, city } = req.body;
        const data = { fullName, email, phone_num, address, state, country, city }
        validation.joiValidation(schema, data);
        const userId = req.userId;
        data.Pro_status = true
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/washer_profile/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    data.image = imageNewName
                    const addWasher = await Service_Providers.update(data, { where: { id: userId } });
                    if (addWasher) {
                        successResponse(
                            res,
                            'Profile Update Successfuly',
                        )
                    }
                }
            });
        }
        else {
            res.status(404).json({ 'message': "image is required" });
        }
    } catch (error) {
        console.log('completeProfile', error);
        badRequest(res, error);
    }
}


module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const getData = await Service_Providers.findOne(
            {
                attributes: [
                    'id', 'full_name', 'email', 'phone_num', 'address', 'state', 'country', 'city',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'washer_profile/' + "',image)"), 'image']
                ],
                where: { id: userId }
            });

        if (getData) {
            successResponseWithData(
                res,
                'User Profile Get Successfuly',
                getData
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not found"
            )
        }
    } catch (error) {
        console.log('getProfile', error);
        badRequest(res, error);
    }
}


module.exports.assignTaskList = async (req, res) => {
    try {
        const washerId = req.userId;
        if (washerId) {
            const getTask = await Washer_task.findAll({
                attributes: { exclude: ['created_at'] },
                include: [
                    {
                        model: Schedule_vehicle,
                        attributes: { exclude: ['created_at'] },
                    }
                ],
                // include: [Schedule_vehicle,Customer_Vehilce],
                where: {
                    washer_id: washerId
                }
            });
            if (getTask) {
                successResponseWithData(
                    res,
                    "Assign task list",
                    getTask
                )
            }
            else {
                notFoundResponse(res, "Not assign task by admin")
            }
        }
    } catch (error) {
        console.log('assignTaskList', error);
        badRequest(res, error);
    }
}



module.exports.service_status = async(req,res) => {
    try {
        const schedule_id = req.body.task_id
        const service_status = req.body.service_status;
        const description = req.body.description;
        const response = await Washer_task.update({status:service_status, comment:description}, { where: { schedul_id: schedule_id } });
        
        if (response) {
            successResponse(
                res,
                'Status Updated Successfuly'
            )
        }
        else{
            errorResponse(res,"Somthing Went Wrong")
        }
    } catch (error) {
        console.log('service_status Error', error);
        badRequest(res, error);
    }
}