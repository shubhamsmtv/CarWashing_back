const joi = require('joi');
const validateSchema = require('../helper/joiValidation');
const { Customer, State, Cities, Pincode, Customer_Vehilce } = require('../model/customerModel');
const { Vehicle_category } = require('../model/adminModel');
const otoGenerator = require('otp-generator')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../helper/db');
const uuid = require('uuid');
const { successResponseWithData, errorResponse, successResponse, notFoundResponse, badRequest,loggingRespons } = require('../middleware/apiResponse');

module.exports.register = async (req, res) => {
    try {
        const schema = joi.object({
            phone_Num: joi.string().min(10).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const phoneNum = req.body.phone_Num;
        const getMobile = await Customer.findOne({ where: { phoneNum: phoneNum } });
        if (getMobile) {
            // if (getMobile && getMobile.status == 1) {
            //     errorResponse(
            //         res,
            //         'This Number is Already Registered'
            //     )
            // }
            // else {
                const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
                const data = { phoneNum, otp }
                const sendOTP = async (phoneNum, otp) => {
                    const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                    if (res.status == 200 && res.data.status == "success") {
                        const response = await Customer.update({ otp: otp }, { where: { phoneNum: phoneNum } });
                        return response
                    }
                }
                const result = await sendOTP(phoneNum, otp);
            console.log(otp);

                if (result) {
                    successResponseWithData(res, "Otp Send Successfully",otp)
                }
            // }
        }
        else {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phoneNum, otp }
            console.log(otp);
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.create(data);
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
            if (result) {
                successResponse(res, "Otp Send Successfully")
            }
        }
    } catch (error) {
        console.log('register Error', error);
        badRequest(res, error);
    }
}

module.exports.otpVerify = async (req, res) => {
    try {
        const schema = joi.object({
            otp: joi.number().min(4).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const otp = req.body.otp;
        const getUser = await Customer.findOne({ where: { otp: otp } });
        if (getUser) {
            const token = jwt.sign(
                {
                    userId: getUser.id,
                    phoneNum: getUser.phoneNum
                },
                process.env.SECRET_KEY,
                {
                    expiresIn: process.env.EXPRIE_TIME
                }
            )
            // await Customer.update({ status: 1 }, { where: { id: getUser.id } });
            loggingRespons(
                res,
                "OTP is verify",
                token
            )
        }
        else {
            errorResponse(
                res,
                "Something went wrong"
            )
        }
    } catch (error) {
        console.log('otpVerify Error', error);
        badRequest(res, error);
    }
}

module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            phone_Num: joi.string().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const phoneNum = req.body.phone_Num;
        const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
        const getUser = await Customer.findOne({ where: { phoneNum: phoneNum } });
        if (getUser) {
            const sendOTP = async (phoneNum, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=91${phoneNum}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.update({ otp: otp }, { where: { id: getUser.id } });
                    return response
                }
            }
            const result = await sendOTP(phoneNum, otp);
            if (result) {
                successResponse(
                    res,
                    "Otp Send Successfully"
                )
            }
        }
        else {
            errorResponse(
                res,
                "User Not Found"
            )
        }
    } catch (error) {
        console.log('login Error', error);
        badRequest(res, error);
    }
}

module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        // console.log("userId", userId);
        // const getData = await Customer.findOne(
        //     {
        //         attributes: ['id', 'fullName', 'email', 'phoneNum', 'address', 'wing', 'society', 'state', 'city', 'pincode']
        //     },
        //     {where: {id : userId}}
        // );
        
        const getData = await Customer.findOne(
            {
                attributes: ['id', 'fullName', 'email', 'phoneNum', 'address', 'wing', 'society', 'state', 'city', 'pincode'],
                where: {id : userId}
            });
            
        if (getData) {
            successResponseWithData(
                res,
                'User Profile Get Successfuly',
                getData
            )
        }
        else {
            errorResponse(
                res,
                "Something went wrong"
            )
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}

module.exports.complitProfile = async (req, res) => {
    try {
        const schema = joi.object({
            fullName: joi.string().min(3).required(),
            email: joi.string().min(3).required(),
            // fullName: joi.string().min(3).required(),
            phoneNum: joi.string().min(10).required(),
            address: joi.string().min(3).required(),
            wing: joi.string().min(3).required(),
            society: joi.string().min(3).required(),
            state: joi.string().min(1).required(),
            city: joi.string().min(3).required(),
            pincode: joi.number().min(3).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const userId = req.userId;
        const updateDate = new Date();
        const status = true
        const { fullName, email, phoneNum, address, wing, society, state, city, pincode } = req.body;
        const data = { fullName, email, phoneNum, address, wing, society, state, city, pincode, updateDate, status };
        if (userId) {
            const updateData = await Customer.update(data, { where: { id: userId } });
            if (updateData) {
                successResponse(
                    res,
                    "Your Profile Is Completed Successfully"
                )
            }
        }
        else {
            errorResponse(
                res,
                "Invaled Token"
            )
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}

module.exports.getVehilceCategory = async (req, res) => {
    try {
        const vehicleType = req.query.type;
        const getCategory = await Vehicle_category.findAll({
            attributes: [
                'id', 'title', 'vehicle_type',
                // [sequelize.literal(`CONCAT('${process.env.IMAGE_BASE_URl}public/image/', images)`), 'images']
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'upImage/' + "',images)"), 'images']
            ],
            where: { vehicle_type : vehicleType }
        });

        if (getCategory) {
            successResponseWithData(
                res,
                "Get vehilce",
                getCategory
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not Found"
            )
        }
    } catch (error) {
        console.log('getVehilceType Error', error);
        badRequest(res, error);
    }
}

module.exports.getVehicleType=async(req, res)=>{
    try {
        const cate = await Vehicle_category.findAll({
            attributes:[
                
                sequelize.literal('distinct `vehicle_type`'),'vehicle_type'
            ],
        })

        if (cate) {
            // const category = cate.map((e)=>{
            //     return {
            //         id : uuid.v1(),
            //         category : e.vehicle_type,
            //     }
            // })
            res.status(200).json({
                status : true,
                category : cate
            });
        } else {
            res.status(200).json({
                status : false,
                message : "vehicle category is not available."
            });
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json({
            status : false,
            error : error
        })
    }
}

module.exports.getState = async (req, res) => {
    try {
        const stateData = await State.findAll();
        if (stateData) {
            successResponseWithData(
                res,
                "State's Get Successfully",
                stateData
            )
        }
        else {
            notFoundResponse(
                res,
                "Data not Found"
            )
        }
    } catch (error) {
        console.log('getState Error', error);
        badRequest(res, error);
    }
}

module.exports.getCity = async (req, res) => {
    try {
        const stateID = req.params.stateID;
        const cityData = await Cities.findAll({ where: { state_id: stateID } });
        if (cityData) {
            successResponseWithData(
                res,
                "Cites Get Successfully",
                cityData
            )
        }
        else {
            notFoundResponse(
                res,
                "City Not Found"
            )
        }
    } catch (error) {
        console.log('getCity Error', error);
        badRequest(res, error);
    }
}

module.exports.getPincode = async (req, res) => {
    try {
        const state_id = req.body.stateID;
        const cities = req.body.cityName;
        if (state_id && cities) {
            const GetPincode = await Pincode.findAll({ where: { city: cities, state_id: state_id } });
            if (GetPincode.length) {
                successResponseWithData(
                    res,
                    "Cites Get Successfully",
                    GetPincode
                )
            }
            else {
                notFoundResponse(
                    res,
                    "City Not Found"
                )
            }
        }
        else {
            res.status(400).json({ 'message': 'State Id and City is required' });
        }
    } catch (error) {
        console.log('getPincode Error', error);
        badRequest(res, error);
    }
}

module.exports.addVehicle = async(req, res) => {
    try {
        const schema = joi.object({
            vehicle_type: joi.string().required(),
            vehicle_title: joi.string().required(),
            vehicle_model: joi.string().required(),
            vehicle_color: joi.string().required(),
            license_num: joi.string().required(),
            parking_num: joi.string().required(),

        });
        validateSchema.joiValidation(schema, req.body);
        const { vehicle_type, vehicle_title, vehicle_model	, vehicle_color	, license_num, parking_num } = req.body;
        const data = { vehicle_type	, vehicle_title, vehicle_model	, vehicle_color	, license_num, parking_num }
        if (req.files) {
            const image = req.files.image;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/vehilceImage/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    data.image = imageNewName
                    const addVehilce = await Customer_Vehilce.create(data);
                    if (addVehilce) {
                        successResponse(
                            res,
                            'Vehilce Data Added Successfuly',
                        )
                    }
                }
            });
        }
        else {
            const addVehilce = await Customer_Vehilce.create(data);
            if (addVehilce) {
                successResponse(
                    res,
                    'Vehilce Data Added Successfuly',
                )
            }
        }
    } catch (error) {
        console.log('addVehilcle Error', error);
        badRequest(res, error);
    }
}