const joi = require('joi');
const validateSchema = require('../helper/joiValidation');
const { Customer, State, Cities, Pincode, Customer_Vehilce, Wallet, Schedule_vehicle, Slider, Address } = require('../model/customerModel');
const { Vehicle_category } = require('../model/adminModel');
const { Washer_service } = require('../model/washerModel');
const otoGenerator = require('otp-generator')
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../helper/db');
const uuid = require('uuid');
const { successResponseWithData, errorResponse, successResponse, notFoundResponse, badRequest, loggingRespons, successCompleteRes, velideUser } = require('../middleware/apiResponse');
const FCM = require('fcm-node');
const server_key = "AAAA3vCB6sE:APA91bHu-xdBFBFvcFvAU5kCVa23__HQjxyGTwRtMFE8zae2aSa-3cR47xQ_5mzA0q1LtDROz89QxwqVxAQlOalipoxgc-m006SRUdS0LM_a7a47yTbRE-8KQ3bjGch1_b4CVtKk8uHj"
const fcm = new FCM(server_key);



module.exports.otpVerify = async (req, res) => {
    try {
        const schema = joi.object({
            phoneNum: joi.string().min(10).required(),
            otp: joi.number().min(4).required(),
            fcm_token: joi.string().required(),
            device_type: joi.number().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const { fcm_token, device_type } = req.body;
        const otp = req.body.otp;
        const phoneNum = req.body.phoneNum;
        const data = { fcm_token, device_type }
        const getUser = await Customer.findOne({
            attributes: { exclude: ['created_at', 'updated_at'] },
            where: { phone_num: phoneNum }
        });
        if (getUser) {
            console.log(getUser.otp == otp)
            if (getUser.otp == otp) {
                await Customer.update(data, { where: { id: getUser.id } })
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
                if (getUser && getUser.status == 1) {
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


module.exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            phone_Num: joi.string().min(10).required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const phone_num = req.body.phone_Num;
        const getMobile = await Customer.findOne({ where: { phone_num: phone_num } });
        console.log('phone_Num', phone_num)
        if (getMobile) {
            const otp = otoGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
            const data = { phone_num, otp }
            const sendOTP = async (phone_num, otp) => {
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phone_num}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.update({ otp: otp }, { where: { phone_num: phone_num } });
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
            const sendOTP = async (phone_num, otp) => {
                console.log('daphone_Numta', phone_num)
                const res = await axios.get(`http://cloudsms.digialaya.com/ApiSmsHttp?UserId=sms@fintranxect.com&pwd=pwd2022&Message=${otp}%20is%20verification%20otp%20for%20finnit.com.%20OTPs%20are%20SECRET.%20DO%20NOT%20disclose%20it%20to%20anyone.%20FINTRANXECT&Contacts=${phone_num}&SenderId=FTLAPP&ServiceName=SMSTRANS&MessageType=1&StartTime=&DLTTemplateId=1707166903059048617`)
                if (res.status == 200 && res.data.status == "success") {
                    const response = await Customer.create(data);
                    console.log(response);
                    return response
                }
            }
            const result = await sendOTP(phone_num, otp);
            if (result) {
                successResponseWithData(res, "Otp Send Successfully", otp)
            }
        }
    } catch (error) {
        console.log('register Error', error);
        badRequest(res, error);
    }
}

module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const getData = await Customer.findOne(
            {
                attributes: [
                    'id', 'fullName', 'email', 'phone_num', 'address', 'wing', 'society', 'state', 'city', 'pincode',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'customerImg/' + "',profile_img)"), 'profile_img']
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
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}


module.exports.uploadProfile = (req, res) => {
    try {
        const userId = req.userId;
        if (req.files && req.files.profile) {
            const image = req.files.profile;
            const imageName = image.name;
            const imageExtantion = imageName.split('.').pop();
            const imageNewName = uuid.v1() + '.' + imageExtantion;;
            const uploadPath = 'public/customerImg/' + imageNewName;
            image.mv(uploadPath, async (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                else {
                    const addProfile = await Customer.update({ profile_img: imageNewName }, { where: { id: userId } });;
                    if (addProfile) {
                        successResponse(
                            res,
                            'Profile Added Successfuly',
                        )
                    }
                }
            });
        }
        else {
            res.json({ 'message': 'profile is required' });
        }
    } catch (error) {
        console.log('getProfile Error', error);
        badRequest(res, error);
    }
}

module.exports.complitProfile = async (req, res) => {
    try {
        const profileData = {};
        if (req.body.fullName) {
            profileData.fullName = req.body.fullName;
        }
        if (req.body.email) {
            profileData.email = req.body.email;
        }
        if (req.body.phoneNum) {
            profileData.phone_num = req.body.phoneNum;
        }
        if (req.body.wing) {
            profileData.wing = req.body.wing;
        }
        if (req.body.society) {
            profileData.society = req.body.society;
        }
        if (req.body.state) {
            profileData.state = req.body.state;
        }
        if (req.body.city) {
            profileData.city = req.body.city;
        }
        if (req.body.pincode) {
            profileData.pincode = req.body.pincode;
        }
        if (req.body.address) {
            profileData.address = req.body.address;
        }
        const user_id = req.userId;
        const status = true
        const { fullName, email, phoneNum, address, wing, society, state, city, pincode } = req.body;
        const data = { fullName, email, phoneNum, address, wing, society, state, city, pincode, status };
        if (user_id) {
            const updateData = await Customer.update(data, { where: { id: user_id } });
            if (updateData) {
                const vehicle_data = await Customer_Vehilce.findOne({ where: { user_id: user_id } });
                if (!vehicle_data) {
                    successCompleteRes(
                        res,
                        "Your Profile Is Completed Successfully",
                        vehicle_data,
                        false
                    )
                }
                else {
                    successCompleteRes(
                        res,
                        "Your Profile Is Completed Successfully",
                        vehicle_data,
                        true
                    )
                }
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
                'id', 'title',
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'vehilceImage/' + "',images)"), 'images']
            ],
            where: { parent_id: vehicleType }
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

module.exports.getVehicleType = async (req, res) => {
    try {
        const getCategory = await Vehicle_category.findAll({
            attributes: [
                ['id', 'vehicle_type'], 'title',

            ],
            where: { parent_id: null }
        });

        if (getCategory) {
            res.status(200).json({
                status: true,
                category: getCategory
            });
        } else {
            res.status(200).json({
                status: false,
                message: "vehicle category is not available."
            });
        }
    } catch (error) {
        console.log("error", error);
        res.status(400).json({
            status: false,
            error: error
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

module.exports.addVehicle = async (req, res) => {
    try {
        const schema = joi.object({
            vehicle_type: joi.string().required(),
            vehicle_title: joi.string().required(),
            vehicle_model: joi.string().required(),
            vehicle_color: joi.string().required(),
            license_num: joi.string().required(),
            parking_num: joi.string().required(),
            image: joi.string().required()
        });
        validateSchema.joiValidation(schema, req.body);
        const user_id = req.userId;
        const getVehicle = await Customer_Vehilce.findAndCountAll({ where: { user_id: user_id } });
        console.log('getVehicle', getVehicle)
        if (getVehicle.count < 4) {
            const status = true
            const { vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image } = req.body;
            const data = { user_id, vehicle_type, vehicle_title, vehicle_model, vehicle_color, license_num, parking_num, image }
            const addVehilce = await Customer_Vehilce.create(data);
            if (addVehilce) {
                await Customer.update({ vehicle_status: true }, { where: { id: user_id } })
                successResponse(
                    res,
                    'Vehilce Data Added Successfuly',
                )
            }
            else {
                errorResponse(res, "Something Went Wrong")
            }
        }
        else {
            errorResponse(res, "You have add only four vehicle");
        }
        return false

        // }
    } catch (error) {
        console.log('addVehilcle Error', error);
        badRequest(res, error);
    }
}


module.exports.vehicleList = async (req, res) => {
    try {
        const userId = req.userId;
        const vehicle_list = await Customer_Vehilce.findAll({ where: { user_id: userId } });
        if (vehicle_list) {
            successResponseWithData(
                res,
                "Vehicle List",
                vehicle_list
            )
        }
        else {
            notFoundResponse(
                res,
                "Vehicle not found"
            )
        }
    } catch (error) {
        console.log('vehicleList Error', error);
        badRequest(res, error);
    }
}


module.exports.getVehicleById = async (req, res) => {
    try {
        const userId = req.userId;
        const vehicleId = req.params.vehicleId;
        if (vehicleId) {
            const vehicle = await Customer_Vehilce.findOne({ where: { id: vehicleId, user_id: userId } });
            if (vehicle) {
                successResponseWithData(
                    res,
                    "Vehicle Finded",
                    vehicle
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Vehicle not found"
                )
            }
        }
        else {
            errorResponse(res, "vehicle id is required");
        }
    } catch (error) {
        console.log('getVehicleById Error', error);
        badRequest(res, error);
    }
}


module.exports.updateVehicle = async (req, res) => {
    try {
        const data = {};
        if (req.body.vehicle_model) {
            data.vehicle_model = req.body.vehicle_model;
        }
        if (req.body.vehicle_color) {
            data.vehicle_color = req.body.vehicle_color;
        }
        if (req.body.license_num) {
            data.license_num = req.body.license_num;
        }
        if (req.body.parking_num) {
            data.parking_num = req.body.parking_num;
        }
        const vehicleId = req.body.vehicleId;
        const user_id = req.userId;
        const upVehicle = await Customer_Vehilce.update(data, { where: { id: vehicleId, user_id: user_id } });
        if (upVehicle) {
            successResponse(
                res,
                "Vehicle Updated Successfully"
            )
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('updateVehicle Error', error);
        badRequest(res, error);
    }
}


module.exports.deleteVehicle = async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        if (vehicleId) {
            const destroy = await Customer_Vehilce.destroy({ where: { id: vehicleId } });
            if (destroy) {
                successResponse(res, "Vehicle Deleted Successfully");
            }
            else {
                errorResponse(
                    res,
                    "Something Went Wrong"
                )
            }
        }
        else {
            errorResponse(res, "vehicle id is required");
        }
    } catch (error) {
        console.log('deleteVehicle Error', error);
        badRequest(res, error);
    }
}

module.exports.addWallet = async (req, res) => {
    try {
        const schema = joi.object({
            amount: joi.number().required(),
            coupon_code: joi.string().required(),
            payment_method: joi.string().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const user_id = req.userId;
        const { amount, coupon_code, payment_method } = req.body;
        const paymentData = { user_id, amount, coupon_code, payment_method }
        const addpayment = await Wallet.create(paymentData);
        if (addpayment) {
            successResponseWithData(
                res,
                "Money will be added in wallet"
            )
        }
        else {
            errorResponse(
                res,
                "Something Went Wrong",
            )
        }
    } catch (error) {
        console.log('addWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.getWallet = async (req, res) => {
    try {
        const user_id = req.userId;
        if (user_id) {
            const walletData = await Wallet.findAll({
                where: {
                    user_id: user_id
                },
                order: [['created_at', 'DESC']],
            });
            if (walletData) {
                successResponseWithData(
                    res,
                    "Transaction History",
                    walletData
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
        else {
            errorResponse(
                res,
                "Something Went Wrong"
            )
        }
    } catch (error) {
        console.log('getWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.walletBalance = async (req, res) => {
    try {
        const user_id = req.userId;
        if (user_id) {
            const totleBal = await Wallet.sum('amount', { where: { user_id: user_id } });
            if (totleBal) {
                successResponseWithData(
                    res,
                    "Totle Amount",
                    totleBal
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
    } catch (error) {
        console.log('getWallet Error', error);
        badRequest(res, error);
    }
}


module.exports.my_services = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            const myService = await Schedule_vehicle.findAll({
                attributes: [
                    'id', 'user_id', 'address', 'vehicle_id', 'schedule_date', 'vehicle_type', 'vehicle_title', 'vehicle_model', 'vehicle_color',
                    'license_num', 'status', 'image',
                    // [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'upImage/' + "',image)"), 'image']
                ],
                where: { user_id: userId }
            });
            if (myService.length) {
                successResponseWithData(
                    res,
                    "My Services",
                    myService
                )
            }
            else {
                notFoundResponse(
                    res,
                    "Data Not Found"
                )
            }
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('my_services Error', error);
        badRequest(res, error);
    }
}




module.exports.setschedule = async (req, res) => {
    try {
        const schema = joi.object({
            schedule_date: joi.date().required(),
            address: joi.string().required(),
            vehicle_id: joi.string().required()
        });
        validateSchema.joiValidation(schema, req.body);
        const user_id = req.userId;
        const { schedule_date, address, vehicle_id } = req.body;
        const data = { user_id, schedule_date, address, vehicle_id };
        const vehicle_data = await Customer_Vehilce.findOne({ where: { id: vehicle_id } });
        data.vehicle_type = vehicle_data.vehicle_type;
        data.vehicle_title = vehicle_data.vehicle_title;
        data.vehicle_model = vehicle_data.vehicle_model;
        data.vehicle_color = vehicle_data.vehicle_color;
        data.license_num = vehicle_data.license_num;
        data.image = vehicle_data.image;
        const createData = await Schedule_vehicle.create(data);
        if (createData) {
            successResponse(res, "Vehicle Schedule Added Successfully");
        }
        else {
            errorResponse(res, "Something Went Wrong")
        }
    } catch (error) {
        console.log('setschedule Error', error);
        badRequest(res, error);
    }
}


module.exports.home = async (req, res) => {
    try {
        const userId = req.userId;
        const completed_services = await Schedule_vehicle.findAll({
            attributes: [
                'id', 'user_id', 'address', 'vehicle_id', 'schedule_date', 'vehicle_type', 'vehicle_title', 'vehicle_model', 'vehicle_color', 'image',
                'license_num', 'status',
                // [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'upImage/' + "',image)"), 'image']
            ],
            where: {
                user_id: userId,
                status: 'Completed'

            }
        });
        const inprocess_services = await Schedule_vehicle.findAll({
            attributes: [
                'id', 'user_id', 'address', 'vehicle_id', 'schedule_date', 'vehicle_type', 'vehicle_title', 'vehicle_model', 'vehicle_color',
                'license_num', 'status', 'image',
                // [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'upImage/' + "',image)"), 'image']
            ],
            where: {
                user_id: userId,
                status: 'In-progress'
            }
        });
        const slider = await Slider.findAll({
            attributes: [
                'id', 'title',
                [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'sliderImg/' + "',image)"), 'image']
            ]
        });
        const array = [{
            inprogress_sevices: inprocess_services,
            complete_sevices: completed_services,
            slider: slider,
        }];
        successResponseWithData(res, "Home data", array);
        // res.status(200).json({
        //     "status":true,
        //     "message":'',
        //     data : array
        // })
    } catch (error) {
        console.log('home Error', error);
        badRequest(res, error);
    }
}



module.exports.address = async (req, res) => {
    try {
        const userId = req.userId;
        const addressList = await Address.findAll({
            attributes: {
                exclude: ['created_at', 'updated_at', 'parking_type', 'lat', 'lng']
            },
            where: { user_id: userId }
        });
        if (addressList.length) {
            successResponseWithData(res, "Address List Data", addressList);
        }
        else {
            notFoundResponse(res, "Address list not found");
        }
    } catch (error) {
        console.log('address Error', error);
        badRequest(res, error);
    }
}


module.exports.addParkingAdrress = async (req, res) => {
    try {
        const user_id = req.userId;
        const schema = joi.object({
            address: joi.string().required(),
            building: joi.string().required(),
            society_name: joi.string().required(),
            lot_num: joi.string().required(),
        });
        validateSchema.joiValidation(schema, req.body);
        const { address, building, society_name, lot_num } = req.body;
        const addressData = { address, building, society_name, lot_num, user_id };
        const addAddress = await Address.create(addressData);
        if (addAddress) {
            successResponse(res, "Address Add Successfully");
        }
        else {
            errorResponse(res, "Something Went Wrong");
        }
    } catch (error) {
        console.log('addParkingAdrress Error', error);
        badRequest(res, error);
    }
}

module.exports.afterService = async (req, res) => {
    try {
        const schedule_id = req.params.schedule_id;
        if (schedule_id) {
            const serviceData = await Washer_service.findAll({
                attributes: [
                    'id', 'schedule_id', 'status', 'created_at', 'updated_at',
                    [sequelize.literal("CONCAT('" + process.env.IMAGE_BASE_URl + 'serviceImg/' + "',image)"), 'image']
                ],
                where: {
                    schedule_id: schedule_id
                }
            });
            if (serviceData) {
                successResponseWithData(res, "Afetr Service data", serviceData);
            }
            else {
                notFoundResponse(res, "Data Not Found");
            }
        }
        else {
            errorResponse(res, "schedule_id is required");
        }
    } catch (error) {
        console.log('afterService Error', error);
        badRequest(res, error);
    }
}



module.exports.feedback = async (req, res) => {
    try {
        const schedule_id = req.body.schedule_id;
        const feedback = req.body.feedback;
        if (schedule_id) {
            const feedbackRes = await Washer_service.update({ feedback: feedback }, { where: { schedule_id: schedule_id } });
            if (feedbackRes) {
                successResponse(res, "Thanks for feedback");
            }
            else {
                errorResponse(res, "Something Went Wrong");
            }
        }
        else {
            errorResponse(res, "schedule_id is required");
        }
    } catch (error) {
        console.log('feedback Error', error);
        badRequest(res, error);
    }
}


module.exports.notification = (req, res) => {
    try {
        const registerToken = req.body.registerToken;
        const title = req.body.title;
        if (registerToken) {
            var msg = {}
            var data = {
                package: "kuch bhi",
                userId: 5,
                eventId: 4,
            }
            msg.to = req.body.registerToken
            msg.data = {
                my_key: 'my value',
                contents: "abcv/",
                body: "Body 9",
                title: "title 9",
                package:"EventData.packagetype",
                userId:2,
                eventId:9
            }
            

            fcm.send(msg, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
        else {
            errorResponse(
                res,
                "registerToken is require",
            )
        }
    } catch (error) {
        console.log('notification Error', error);
        badRequest(res, error);
    }
}