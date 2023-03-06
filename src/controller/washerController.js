const { badRequest, successResponse } = require('../middleware/apiResponse');
const joi = require('joi');
const otoGenerator = require('otp-generator')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {sequelize} = require('../helper/db');
const validation = require('../helper/joiValidation');
const { Washer_service, Service_Providers } = require('../model/washerModel');
const { Customer_Vehilce, Customer, } = require('../model/customerModel')
const uuid = require('uuid')
const { successResponseWithData, notFoundResponse, loggingRespons } = require('../middleware/apiResponse');



module.exports.add_service = async (req, res) => {
    try {
        const schema = joi.object({
            userId: joi.number().required(),
            date: joi.date().required(),
            time: joi.string().required(),
        });
        validation.joiValidation(schema, req.body.data, req.body.time);
        const { userId, date, time } = req.body;
        const serviceData = { userId, date, time }
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/serviceImg/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    serviceData.image = imageNewName
                    const addServise = await Washer_service.create(serviceData);
                    if (addServise) {
                        successResponse(
                            res,
                            'Service Added Successfuly',
                        )
                    }
                }
            });
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
            phone_num: joi.string().min(10).required(),
        });
        validation.joiValidation(schema, req.body);
        const phoneNum = req.body.phone_num;
        const getMobile = await Service_Providers.findOne({ where: { phoneNum: phoneNum } });
        if (getMobile) {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phoneNum, otp }
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Service_Providers.update({ otp: otp }, { where: { phoneNum: phoneNum } });
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
            console.log(otp);

            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
        else {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phoneNum, otp }
            console.log(otp);
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Service_Providers.create(data);
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
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
            phoneNum: joi.string().min(10).required(),
            otp: joi.number().min(4).required(),
            fcm_token: joi.string().required(),
            device_type: joi.number().required(),
        });
        validation.joiValidation(schema, req.body);
        const { fcm_token, device_type } = req.body;
        const otp = req.body.otp;
        const phoneNum = req.body.phoneNum;
        const data = { fcm_token, device_type }
        const getUser = await Service_Providers.findOne({
            attributes: { exclude: ['createDate', 'updateDate'] },
            where: { phoneNum: phoneNum }
        });
        if (getUser) {
            console.log(getUser.otp == otp)
            if (getUser.otp == otp) {
                await Service_Providers.update(data, { where: { id: getUser.id } })
                const token = jwt.sign(
                    {
                        userId: getUser.id,
                        phoneNum: getUser.phoneNum,
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
            fullName: joi.string().min(3).required(),
            email: joi.string().email().min(3).required(),
            phoneNum: joi.string().min(10).required(),
            address: joi.string().min(3).required(),
            state: joi.string().min(1).required(),
            country: joi.string().min(3).required(),
            city: joi.string().min(3).required(),
        });
        const { fullName, email, phoneNum, address, state, country, city } = req.body;
        const data = { fullName, email, phoneNum, address, state, country, city }
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
                    'id', 'fullName', 'email', 'phoneNum', 'address', 'state', 'country', 'city',
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